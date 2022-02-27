import { request, request_stream } from '../Request';
import { Readable } from 'node:stream';
import { IncomingMessage } from 'node:http';
import { StreamType } from '../YouTube/stream';
import { Timer } from '../YouTube/classes/LiveStream';
import { PlaylistJSON, SoundTrackJSON } from './constants';

export interface SoundCloudUser {
    /**
     * SoundCloud User Name
     */
    name: string;
    /**
     * SoundCloud User ID
     */
    id: string;
    /**
     * SoundCloud User URL
     */
    url: string;
    /**
     * SoundCloud Class type. == "user"
     */
    type: 'track' | 'playlist' | 'user';
    /**
     * SoundCloud User Verified status
     */
    verified: boolean;
    /**
     * SoundCloud User Description
     */
    description: string;
    /**
     * SoundCloud User First Name
     */
    first_name: string;
    /**
     * SoundCloud User Full Name
     */
    full_name: string;
    /**
     * SoundCloud User Last Name
     */
    last_name: string;
    /**
     * SoundCloud User thumbnail URL
     */
    thumbnail: string;
}

export interface SoundCloudTrackDeprecated {
    /**
     * SoundCloud Track fetched status
     */
    fetched: boolean;
    /**
     * SoundCloud Track ID
     */
    id: number;
    /**
     * SoundCloud Class type. == "track"
     */
    type: 'track';
}

export interface SoundCloudTrackFormat {
    /**
     * SoundCloud Track Format Url
     */
    url: string;
    /**
     * SoundCloud Track Format preset
     */
    preset: string;
    /**
     * SoundCloud Track Format Duration
     */
    duration: number;
    /**
     * SoundCloud Track Format data containing protocol and mime_type
     */
    format: {
        protocol: string;
        mime_type: string;
    };
    /**
     * SoundCloud Track Format quality
     */
    quality: string;
}
/**
 * SoundCloud Track Class
 */
export class SoundCloudTrack {
    /**
     * SoundCloud Track Name
     */
    name: string;
    /**
     * SoundCloud Track ID
     */
    id: number;
    /**
     * SoundCloud Track url
     */
    url: string;
    /**
     * User friendly SoundCloud track URL
     */
    permalink: string;
    /**
     * SoundCloud Track fetched status
     */
    fetched: boolean;
    /**
     * SoundCloud Class type. === "track"
     */
    type: 'track' | 'playlist' | 'user';
    /**
     * SoundCloud Track Duration in seconds
     */
    durationInSec: number;
    /**
     * SoundCloud Track Duration in miili seconds
     */
    durationInMs: number;
    /**
     * SoundCloud Track formats data
     */
    formats: SoundCloudTrackFormat[];
    /**
     * SoundCloud Track Publisher Data
     */
    publisher: {
        name: string;
        id: number;
        artist: string;
        contains_music: boolean;
        writer_composer: string;
    } | null;
    /**
     * SoundCloud Track thumbnail
     */
    thumbnail: string;
    /**
     * SoundCloud Track user data
     */
    user: SoundCloudUser;
    /**
     * Constructor for SoundCloud Track Class
     * @param data JSON parsed track html data
     */
    constructor(data: any) {
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
        else this.publisher = null;
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
    toJSON(): SoundTrackJSON {
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
/**
 * SoundCloud Playlist Class
 */
export class SoundCloudPlaylist {
    /**
     * SoundCloud Playlist Name
     */
    name: string;
    /**
     * SoundCloud Playlist ID
     */
    id: number;
    /**
     * SoundCloud Playlist URL
     */
    url: string;
    /**
     * SoundCloud Class type. == "playlist"
     */
    type: 'track' | 'playlist' | 'user';
    /**
     * SoundCloud Playlist Sub type. == "album" for soundcloud albums
     */
    sub_type: string;
    /**
     * SoundCloud Playlist Total Duration in seconds
     */
    durationInSec: number;
    /**
     * SoundCloud Playlist Total Duration in milli seconds
     */
    durationInMs: number;
    /**
     * SoundCloud Playlist user data
     */
    user: SoundCloudUser;
    /**
     * SoundCloud Playlist tracks [ It can be fetched or not fetched ]
     */
    tracks: SoundCloudTrack[] | SoundCloudTrackDeprecated[];
    /**
     * SoundCloud Playlist tracks number
     */
    tracksCount: number;
    /**
     * SoundCloud Client ID provided by user
     * @private
     */
    private client_id: string;
    /**
     * Constructor for SoundCloud Playlist
     * @param data JSON parsed SoundCloud playlist data
     * @param client_id Provided SoundCloud Client ID
     */
    constructor(data: any, client_id: string) {
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
        const tracks: any[] = [];
        data.tracks.forEach((track: any) => {
            if (track.title) {
                tracks.push(new SoundCloudTrack(track));
            } else
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
    async fetch(): Promise<SoundCloudPlaylist> {
        const work: any[] = [];
        for (let i = 0; i < this.tracks.length; i++) {
            if (!this.tracks[i].fetched) {
                work.push(
                    new Promise(async (resolve) => {
                        const num = i;
                        const data = await request(
                            `https://api-v2.soundcloud.com/tracks/${this.tracks[i].id}?client_id=${this.client_id}`
                        );

                        this.tracks[num] = new SoundCloudTrack(JSON.parse(data));
                        resolve('');
                    })
                );
            }
        }
        await Promise.allSettled(work);
        return this;
    }
    /**
     * Get total no. of fetched tracks
     * @see {@link SoundCloudPlaylist.all_tracks}
     */
    get total_tracks(): number {
        let count = 0;
        this.tracks.forEach((track) => {
            if (track instanceof SoundCloudTrack) count++;
            else return;
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
    async all_tracks(): Promise<SoundCloudTrack[]> {
        await this.fetch();

        return this.tracks as SoundCloudTrack[];
    }
    /**
     * Converts Class to JSON data
     * @returns JSON parsed data
     */
    toJSON(): PlaylistJSON {
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
/**
 * SoundCloud Stream class
 */
export class SoundCloudStream {
    /**
     * Readable Stream through which data passes
     */
    stream: Readable;
    /**
     * Type of audio data that we recieved from normal youtube url.
     */
    type: StreamType;
    /**
     * Dash Url containing segment urls.
     * @private
     */
    private url: string;
    /**
     * Total time of downloaded segments data.
     * @private
     */
    private downloaded_time: number;
    /**
     * Timer for looping code every 5 minutes
     * @private
     */
    private timer: Timer;
    /**
     * Total segments Downloaded so far
     * @private
     */
    private downloaded_segments: number;
    /**
     * Incoming message that we recieve.
     *
     * Storing this is essential.
     * This helps to destroy the TCP connection completely if you stopped player in between the stream
     * @private
     */
    private request: IncomingMessage | null;
    /**
     * Array of segment time. Useful for calculating downloaded_time.
     */
    private time: number[];
    /**
     * Array of segment_urls in dash file.
     */
    private segment_urls: string[];
    /**
     * Constructor for SoundCloud Stream
     * @param url Dash url containing dash file.
     * @param type Stream Type
     */
    constructor(url: string, type: StreamType = StreamType.Arbitrary) {
        this.stream = new Readable({ highWaterMark: 5 * 1000 * 1000, read() {} });
        this.type = type;
        this.url = url;
        this.downloaded_time = 0;
        this.request = null;
        this.downloaded_segments = 0;
        this.time = [];
        this.timer = new Timer(() => {
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
    private async parser() {
        const response = await request(this.url).catch((err: Error) => {
            return err;
        });
        if (response instanceof Error) throw response;
        const array = response.split('\n');
        array.forEach((val) => {
            if (val.startsWith('#EXTINF:')) {
                this.time.push(parseFloat(val.replace('#EXTINF:', '')));
            } else if (val.startsWith('https')) {
                this.segment_urls.push(val);
            }
        });
        return;
    }
    /**
     * Starts looping of code for getting all segments urls data
     */
    private async start() {
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
    private async loop() {
        if (this.stream.destroyed) {
            this.cleanup();
            return;
        }
        if (this.time.length === 0 || this.segment_urls.length === 0) {
            this.cleanup();
            this.stream.push(null);
            return;
        }
        this.downloaded_time += this.time.shift() as number;
        this.downloaded_segments++;
        const stream = await request_stream(this.segment_urls.shift() as string).catch((err: Error) => err);
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
            if (this.downloaded_time >= 300) return;
            else this.loop();
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
    private cleanup() {
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
