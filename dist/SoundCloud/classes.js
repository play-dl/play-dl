"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundCloudStream = exports.SoundCloudPlaylist = exports.SoundCloudTrack = void 0;
const Request_1 = require("../Request");
const node_stream_1 = require("node:stream");
const stream_1 = require("../YouTube/stream");
const LiveStream_1 = require("../YouTube/classes/LiveStream");
/**
 * SoundCloud Track Class
 */
class SoundCloudTrack {
    /**
     * Constructor for SoundCloud Track Class
     * @param data JSON parsed track html data
     */
    constructor(data) {
        this.name = data.title;
        this.id = data.id;
        this.url = data.uri;
        this.permalink = data.permalink_url;
        this.fetched = true;
        this.type = 'track';
        this.durationInSec = Math.round(Number(data.duration) / 1000);
        this.durationInMs = Number(data.duration);
        if (data.publisher_metadata)
            this.publisher = {
                name: data.publisher_metadata.publisher,
                id: data.publisher_metadata.id,
                artist: data.publisher_metadata.artist,
                contains_music: Boolean(data.publisher_metadata.contains_music) || false,
                writer_composer: data.publisher_metadata.writer_composer
            };
        else
            this.publisher = null;
        this.formats = data.media.transcodings;
        this.user = {
            name: data.user.username,
            id: data.user.id,
            type: 'user',
            url: data.user.permalink_url,
            verified: Boolean(data.user.verified) || false,
            description: data.user.description,
            first_name: data.user.first_name,
            full_name: data.user.full_name,
            last_name: data.user.last_name,
            thumbnail: data.user.avatar_url
        };
        this.thumbnail = data.artwork_url;
    }
    /**
     * Converts class to JSON
     * @returns JSON parsed Data
     */
    toJSON() {
        return {
            name: this.name,
            id: this.id,
            url: this.url,
            permalink: this.permalink,
            fetched: this.fetched,
            durationInMs: this.durationInMs,
            durationInSec: this.durationInSec,
            publisher: this.publisher,
            formats: this.formats,
            thumbnail: this.thumbnail,
            user: this.user
        };
    }
}
exports.SoundCloudTrack = SoundCloudTrack;
/**
 * SoundCloud Playlist Class
 */
class SoundCloudPlaylist {
    /**
     * Constructor for SoundCloud Playlist
     * @param data JSON parsed SoundCloud playlist data
     * @param client_id Provided SoundCloud Client ID
     */
    constructor(data, client_id) {
        this.name = data.title;
        this.id = data.id;
        this.url = data.uri;
        this.client_id = client_id;
        this.type = 'playlist';
        this.sub_type = data.set_type;
        this.durationInSec = Math.round(Number(data.duration) / 1000);
        this.durationInMs = Number(data.duration);
        this.user = {
            name: data.user.username,
            id: data.user.id,
            type: 'user',
            url: data.user.permalink_url,
            verified: Boolean(data.user.verified) || false,
            description: data.user.description,
            first_name: data.user.first_name,
            full_name: data.user.full_name,
            last_name: data.user.last_name,
            thumbnail: data.user.avatar_url
        };
        this.tracksCount = data.track_count;
        const tracks = [];
        data.tracks.forEach((track) => {
            if (track.title) {
                tracks.push(new SoundCloudTrack(track));
            }
            else
                tracks.push({
                    id: track.id,
                    fetched: false,
                    type: 'track'
                });
        });
        this.tracks = tracks;
    }
    /**
     * Fetches all unfetched songs in a playlist.
     *
     * For fetching songs and getting all songs, see `fetched_tracks` property.
     * @returns playlist class
     */
    async fetch() {
        const work = [];
        for (let i = 0; i < this.tracks.length; i++) {
            if (!this.tracks[i].fetched) {
                work.push(new Promise(async (resolve) => {
                    const num = i;
                    const data = await (0, Request_1.request)(`https://api-v2.soundcloud.com/tracks/${this.tracks[i].id}?client_id=${this.client_id}`);
                    this.tracks[num] = new SoundCloudTrack(JSON.parse(data));
                    resolve('');
                }));
            }
        }
        await Promise.allSettled(work);
        return this;
    }
    /**
     * Get total no. of fetched tracks
     * @see {@link SoundCloudPlaylist.all_tracks}
     */
    get total_tracks() {
        let count = 0;
        this.tracks.forEach((track) => {
            if (track instanceof SoundCloudTrack)
                count++;
            else
                return;
        });
        return count;
    }
    /**
     * Fetches all the tracks in the playlist and returns them
     *
     * ```ts
     * const playlist = await play.soundcloud('playlist url')
     *
     * const tracks = await playlist.all_tracks()
     * ```
     * @returns An array of {@link SoundCloudTrack}
     */
    async all_tracks() {
        await this.fetch();
        return this.tracks;
    }
    /**
     * Converts Class to JSON data
     * @returns JSON parsed data
     */
    toJSON() {
        return {
            name: this.name,
            id: this.id,
            sub_type: this.sub_type,
            url: this.url,
            durationInMs: this.durationInMs,
            durationInSec: this.durationInSec,
            tracksCount: this.tracksCount,
            user: this.user,
            tracks: this.tracks
        };
    }
}
exports.SoundCloudPlaylist = SoundCloudPlaylist;
/**
 * SoundCloud Stream class
 */
class SoundCloudStream {
    /**
     * Constructor for SoundCloud Stream
     * @param url Dash url containing dash file.
     * @param type Stream Type
     */
    constructor(url, type = stream_1.StreamType.Arbitrary) {
        this.stream = new node_stream_1.Readable({ highWaterMark: 5 * 1000 * 1000, read() { } });
        this.type = type;
        this.url = url;
        this.downloaded_time = 0;
        this.request = null;
        this.downloaded_segments = 0;
        this.time = [];
        this.timer = new LiveStream_1.Timer(() => {
            this.timer.reuse();
            this.start();
        }, 280);
        this.segment_urls = [];
        this.stream.on('close', () => {
            this.cleanup();
        });
        this.start();
    }
    /**
     * Parses SoundCloud dash file.
     * @private
     */
    async parser() {
        const response = await (0, Request_1.request)(this.url).catch((err) => {
            return err;
        });
        if (response instanceof Error)
            throw response;
        const array = response.split('\n');
        array.forEach((val) => {
            if (val.startsWith('#EXTINF:')) {
                this.time.push(parseFloat(val.replace('#EXTINF:', '')));
            }
            else if (val.startsWith('https')) {
                this.segment_urls.push(val);
            }
        });
        return;
    }
    /**
     * Starts looping of code for getting all segments urls data
     */
    async start() {
        if (this.stream.destroyed) {
            this.cleanup();
            return;
        }
        this.time = [];
        this.segment_urls = [];
        this.downloaded_time = 0;
        await this.parser();
        this.segment_urls.splice(0, this.downloaded_segments);
        this.loop();
    }
    /**
     * Main Loop function for getting all segments urls data
     */
    async loop() {
        if (this.stream.destroyed) {
            this.cleanup();
            return;
        }
        if (this.time.length === 0 || this.segment_urls.length === 0) {
            this.cleanup();
            this.stream.push(null);
            return;
        }
        this.downloaded_time += this.time.shift();
        this.downloaded_segments++;
        const stream = await (0, Request_1.request_stream)(this.segment_urls.shift()).catch((err) => err);
        if (stream instanceof Error) {
            this.stream.emit('error', stream);
            this.cleanup();
            return;
        }
        this.request = stream;
        stream.on('data', (c) => {
            this.stream.push(c);
        });
        stream.on('end', () => {
            if (this.downloaded_time >= 300)
                return;
            else
                this.loop();
        });
        stream.once('error', (err) => {
            this.stream.emit('error', err);
        });
    }
    /**
     * This cleans every used variable in class.
     *
     * This is used to prevent re-use of this class and helping garbage collector to collect it.
     */
    cleanup() {
        this.timer.destroy();
        this.request?.destroy();
        this.url = '';
        this.downloaded_time = 0;
        this.downloaded_segments = 0;
        this.request = null;
        this.time = [];
        this.segment_urls = [];
    }
    /**
     * Pauses timer.
     * Stops running of loop.
     *
     * Useful if you don't want to get excess data to be stored in stream.
     */
    pause() {
        this.timer.pause();
    }
    /**
     * Resumes timer.
     * Starts running of loop.
     */
    resume() {
        this.timer.resume();
    }
}
exports.SoundCloudStream = SoundCloudStream;
//# sourceMappingURL=classes.js.map