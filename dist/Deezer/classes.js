"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeezerPlaylist = exports.DeezerAlbum = exports.DeezerTrack = void 0;
const Request_1 = require("../Request");
/**
 * Class representing a Deezer track
 */
class DeezerTrack {
    /**
     * Creates a Deezer track from the data in an API response
     * @param data the data to use to create the track
     * @param partial Whether the track should be partial
     * @see {@link DeezerTrack.partial}
     */
    constructor(data, partial) {
        this.id = data.id;
        this.title = data.title;
        this.shortTitle = data.title_short;
        this.url = data.link;
        this.durationInSec = data.duration;
        this.rank = data.rank;
        this.explicit = data.explicit_lyrics;
        this.previewURL = data.preview;
        this.artist = new DeezerArtist(data.artist);
        this.album = new DeezerTrackAlbum(data.album);
        this.type = 'track';
        this.partial = partial;
        if (!partial) {
            this.trackPosition = data.track_position;
            this.diskNumber = data.disk_number;
            this.releaseDate = new Date(data.release_date);
            this.bpm = data.bpm;
            this.gain = data.gain;
            this.contributors = [];
            data.contributors.forEach((contributor) => {
                this.contributors?.push(new DeezerArtist(contributor));
            });
        }
    }
    /**
     * Fetches and populates the missing fields
     *
     * The property {@link partial} will be `false` if this method finishes successfully.
     *
     * @returns A promise with the same track this method was called on.
     */
    async fetch() {
        if (!this.partial)
            return this;
        const response = await (0, Request_1.request)(`https://api.deezer.com/track/${this.id}/`).catch((err) => err);
        if (response instanceof Error)
            throw response;
        const jsonData = JSON.parse(response);
        this.partial = false;
        this.trackPosition = jsonData.track_position;
        this.diskNumber = jsonData.disk_number;
        this.releaseDate = new Date(jsonData.release_date);
        this.bpm = jsonData.bpm;
        this.gain = jsonData.gain;
        this.contributors = [];
        jsonData.contributors.forEach((contributor) => {
            this.contributors?.push(new DeezerArtist(contributor));
        });
        return this;
    }
    /**
     * Converts instances of this class to JSON data
     * @returns JSON data.
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            shortTitle: this.shortTitle,
            url: this.url,
            durationInSec: this.durationInSec,
            rank: this.rank,
            explicit: this.explicit,
            previewURL: this.previewURL,
            artist: this.artist,
            album: this.album,
            type: this.type,
            trackPosition: this.trackPosition,
            diskNumber: this.diskNumber,
            releaseDate: this.releaseDate,
            bpm: this.bpm,
            gain: this.gain,
            contributors: this.contributors
        };
    }
}
exports.DeezerTrack = DeezerTrack;
/**
 * Class for Deezer Albums
 */
class DeezerAlbum {
    /**
     * Creates a Deezer album from the data in an API response
     * @param data the data to use to create the album
     * @param partial Whether the album should be partial
     * @see {@link DeezerAlbum.partial}
     */
    constructor(data, partial) {
        this.id = data.id;
        this.title = data.title;
        this.url = data.link;
        this.recordType = data.record_type;
        this.explicit = data.explicit_lyrics;
        this.artist = new DeezerArtist(data.artist);
        this.type = 'album';
        this.tracksCount = data.nb_tracks;
        this.contributors = [];
        this.genres = [];
        this.tracks = [];
        this.cover = {
            xl: data.cover_xl,
            big: data.cover_big,
            medium: data.cover_medium,
            small: data.cover_small
        };
        this.partial = partial;
        if (!partial) {
            this.upc = data.upc;
            this.durationInSec = data.duration;
            this.numberOfFans = data.fans;
            this.releaseDate = new Date(data.release_date);
            this.available = data.available;
            data.contributors.forEach((contributor) => {
                this.contributors?.push(new DeezerArtist(contributor));
            });
            data.genres.data.forEach((genre) => {
                this.genres?.push({
                    name: genre.name,
                    picture: {
                        xl: `${genre.picture}?size=xl`,
                        big: `${genre.picture}?size=big`,
                        medium: `${genre.picture}?size=medium`,
                        small: `${genre.picture}?size=small`
                    }
                });
            });
            const trackAlbum = {
                id: this.id,
                title: this.title,
                cover_xl: this.cover.xl,
                cover_big: this.cover.big,
                cover_medium: this.cover.medium,
                cover_small: this.cover.small,
                release_date: data.release_date
            };
            data.tracks.data.forEach((track) => {
                track.album = trackAlbum;
                this.tracks.push(new DeezerTrack(track, true));
            });
        }
    }
    /**
     * Fetches and populates the missing fields including all tracks.
     *
     * The property {@link DeezerAlbum.partial} will be `false` if this method finishes successfully.
     *
     * @returns A promise with the same album this method was called on.
     */
    async fetch() {
        if (!this.partial)
            return this;
        const response = await (0, Request_1.request)(`https://api.deezer.com/album/${this.id}/`).catch((err) => err);
        if (response instanceof Error)
            throw response;
        const jsonData = JSON.parse(response);
        this.partial = false;
        this.upc = jsonData.upc;
        this.durationInSec = jsonData.duration;
        this.numberOfFans = jsonData.fans;
        this.releaseDate = new Date(jsonData.release_date);
        this.available = jsonData.available;
        this.contributors = [];
        this.genres = [];
        this.tracks = [];
        jsonData.contributors.forEach((contributor) => {
            this.contributors?.push(new DeezerArtist(contributor));
        });
        jsonData.genres.data.forEach((genre) => {
            this.genres?.push({
                name: genre.name,
                picture: {
                    xl: `${genre.picture}?size=xl`,
                    big: `${genre.picture}?size=big`,
                    medium: `${genre.picture}?size=medium`,
                    small: `${genre.picture}?size=small`
                }
            });
        });
        const trackAlbum = {
            id: this.id,
            title: this.title,
            cover_xl: this.cover.xl,
            cover_big: this.cover.big,
            cover_medium: this.cover.medium,
            cover_small: this.cover.small,
            release_date: jsonData.release_date
        };
        jsonData.tracks.data.forEach((track) => {
            track.album = trackAlbum;
            this.tracks.push(new DeezerTrack(track, true));
        });
        return this;
    }
    /**
     * Fetches all the tracks in the album and returns them
     *
     * ```ts
     * const album = await play.deezer('album url')
     *
     * const tracks = await album.all_tracks()
     * ```
     * @returns An array of {@link DeezerTrack}
     */
    async all_tracks() {
        await this.fetch();
        return this.tracks;
    }
    /**
     * Converts instances of this class to JSON data
     * @returns JSON data.
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            url: this.url,
            recordType: this.recordType,
            explicit: this.explicit,
            artist: this.artist,
            cover: this.cover,
            type: this.type,
            upc: this.upc,
            tracksCount: this.tracksCount,
            durationInSec: this.durationInSec,
            numberOfFans: this.numberOfFans,
            releaseDate: this.releaseDate,
            available: this.available,
            genres: this.genres,
            contributors: this.contributors,
            tracks: this.tracks.map((track) => track.toJSON())
        };
    }
}
exports.DeezerAlbum = DeezerAlbum;
/**
 * Class for Deezer Playlists
 */
class DeezerPlaylist {
    /**
     * Creates a Deezer playlist from the data in an API response
     * @param data the data to use to create the playlist
     * @param partial Whether the playlist should be partial
     * @see {@link DeezerPlaylist.partial}
     */
    constructor(data, partial) {
        this.id = data.id;
        this.title = data.title;
        this.public = data.public;
        this.url = data.link;
        this.creationDate = new Date(data.creation_date);
        this.type = 'playlist';
        this.tracksCount = data.nb_tracks;
        this.tracks = [];
        this.picture = {
            xl: data.picture_xl,
            big: data.picture_big,
            medium: data.picture_medium,
            small: data.picture_small
        };
        if (data.user) {
            this.creator = {
                id: data.user.id,
                name: data.user.name
            };
        }
        else {
            this.creator = {
                id: data.creator.id,
                name: data.creator.name
            };
        }
        this.partial = partial;
        if (!partial) {
            this.description = data.description;
            this.durationInSec = data.duration;
            this.isLoved = data.is_loved_track;
            this.collaborative = data.collaborative;
            this.fans = data.fans;
            if (this.public) {
                this.tracks = data.tracks.data.map((track) => {
                    return new DeezerTrack(track, true);
                });
            }
        }
    }
    /**
     * Fetches and populates the missing fields, including all tracks.
     *
     * The property {@link DeezerPlaylist.partial} will be `false` if this method finishes successfully.
     *
     * @returns A promise with the same playlist this method was called on.
     */
    async fetch() {
        if (!this.partial && (this.tracks.length === this.tracksCount || !this.public)) {
            return this;
        }
        if (this.partial) {
            const response = await (0, Request_1.request)(`https://api.deezer.com/playlist/${this.id}/`).catch((err) => err);
            if (response instanceof Error)
                throw response;
            const jsonData = JSON.parse(response);
            this.partial = false;
            this.description = jsonData.description;
            this.durationInSec = jsonData.duration;
            this.isLoved = jsonData.is_loved_track;
            this.collaborative = jsonData.collaborative;
            this.fans = jsonData.fans;
            if (this.public) {
                this.tracks = jsonData.tracks.data.map((track) => {
                    return new DeezerTrack(track, true);
                });
            }
        }
        const currentTracksCount = this.tracks.length;
        if (this.public && currentTracksCount !== this.tracksCount) {
            let missing = this.tracksCount - currentTracksCount;
            if (missing > 1000)
                missing = 1000;
            const promises = [];
            for (let i = 1; i <= Math.ceil(missing / 100); i++) {
                promises.push(new Promise(async (resolve, reject) => {
                    const response = await (0, Request_1.request)(`https://api.deezer.com/playlist/${this.id}/tracks?limit=100&index=${i * 100}`).catch((err) => reject(err));
                    if (typeof response !== 'string')
                        return;
                    const jsonData = JSON.parse(response);
                    const tracks = jsonData.data.map((track) => {
                        return new DeezerTrack(track, true);
                    });
                    resolve(tracks);
                }));
            }
            const results = await Promise.allSettled(promises);
            const newTracks = [];
            for (const result of results) {
                if (result.status === 'fulfilled') {
                    newTracks.push(...result.value);
                }
                else {
                    throw result.reason;
                }
            }
            this.tracks.push(...newTracks);
        }
        return this;
    }
    /**
     * Fetches all the tracks in the playlist and returns them
     *
     * ```ts
     * const playlist = await play.deezer('playlist url')
     *
     * const tracks = await playlist.all_tracks()
     * ```
     * @returns An array of {@link DeezerTrack}
     */
    async all_tracks() {
        await this.fetch();
        return this.tracks;
    }
    /**
     * Converts instances of this class to JSON data
     * @returns JSON data.
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            public: this.public,
            url: this.url,
            picture: this.picture,
            creationDate: this.creationDate,
            type: this.type,
            creator: this.creator,
            tracksCount: this.tracksCount,
            description: this.description,
            durationInSec: this.durationInSec,
            isLoved: this.isLoved,
            collaborative: this.collaborative,
            fans: this.fans,
            tracks: this.tracks.map((track) => track.toJSON())
        };
    }
}
exports.DeezerPlaylist = DeezerPlaylist;
class DeezerTrackAlbum {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.url = `https://www.deezer.com/album/${data.id}/`;
        this.cover = {
            xl: data.cover_xl,
            big: data.cover_big,
            medium: data.cover_medium,
            small: data.cover_small
        };
        if (data.release_date)
            this.releaseDate = new Date(data.release_date);
    }
}
/**
 * Class representing a Deezer artist
 */
class DeezerArtist {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.url = data.link ? data.link : `https://www.deezer.com/artist/${data.id}/`;
        if (data.picture_xl)
            this.picture = {
                xl: data.picture_xl,
                big: data.picture_big,
                medium: data.picture_medium,
                small: data.picture_small
            };
        if (data.role)
            this.role = data.role;
    }
}
//# sourceMappingURL=classes.js.map