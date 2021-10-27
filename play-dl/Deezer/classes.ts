import { request } from '../Request';

interface DeezerImage {
    xl: string;
    big: string;
    medium: string;
    small: string;
}

interface DeezerGenre {
    name: string;
    picture: DeezerImage;
}

interface DeezerUser {
    id: number;
    name: string;
}

/**
 * Class for Deezer Tracks
 */
export class DeezerTrack {
    id: number;
    title: string;
    shortTitle: string;
    url: string;
    durationInSec: number;
    rank: number;
    explicit: boolean;
    previewURL: string;
    artist: DeezerArtist;
    album: DeezerTrackAlbum;
    type: 'track' | 'playlist' | 'album';

    /**
     * true for tracks in search results and false if the track was fetched directly.
     */
    partial: boolean;

    trackPosition?: number;
    diskNumber?: number;
    releaseDate?: Date;
    bpm?: number;
    gain?: number;
    contributors?: DeezerArtist[];

    constructor(data: any, partial: boolean) {
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

            data.contributors.forEach((contributor: any) => {
                this.contributors?.push(new DeezerArtist(contributor));
            });
        }
    }

    /**
     * Fetches the missing data for a partial {@link DeezerTrack}.
     */
    async fetch(): Promise<DeezerTrack> {
        if (!this.partial) return this;

        const response = await request(`https://api.deezer.com/track/${this.id}/`).catch((err: Error) => err);

        if (response instanceof Error) throw response;
        const jsonData = JSON.parse(response);

        this.partial = false;

        this.trackPosition = jsonData.track_position;
        this.diskNumber = jsonData.disk_number;
        this.releaseDate = new Date(jsonData.release_date);
        this.bpm = jsonData.bpm;
        this.gain = jsonData.gain;
        this.contributors = [];

        jsonData.contributors.forEach((contributor: any) => {
            this.contributors?.push(new DeezerArtist(contributor));
        });

        return this;
    }

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
/**
 * Class for Deezer Albums
 */
export class DeezerAlbum {
    id: number;
    title: string;
    url: string;
    recordType: string;
    explicit: boolean;
    artist: DeezerArtist;
    cover: DeezerImage;
    type: 'track' | 'playlist' | 'album';
    tracksCount: number;

    /**
     * true for albums in search results and false if the album was fetched directly.
     */
    partial: boolean;

    upc?: string;
    durationInSec?: number;
    numberOfFans?: number;
    releaseDate?: Date;
    available?: boolean;
    genres?: DeezerGenre[];
    contributors?: DeezerArtist[];

    tracks: DeezerTrack[];

    constructor(data: any, partial: boolean) {
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

            data.contributors.forEach((contributor: any) => {
                this.contributors?.push(new DeezerArtist(contributor));
            });

            data.genres.data.forEach((genre: any) => {
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

            const trackAlbum: any = {
                id: this.id,
                title: this.title,
                cover_xl: this.cover.xl,
                cover_big: this.cover.big,
                cover_medium: this.cover.medium,
                cover_small: this.cover.small,
                release_date: data.release_date
            };
            data.tracks.data.forEach((track: any) => {
                track.album = trackAlbum;
                this.tracks.push(new DeezerTrack(track, true));
            });
        }
    }

    /**
     * Fetches the missing data for a partial {@link DeezerAlbum}.
     */
    async fetch(): Promise<DeezerAlbum> {
        if (!this.partial) return this;

        const response = await request(`https://api.deezer.com/album/${this.id}/`).catch((err: Error) => err);

        if (response instanceof Error) throw response;
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

        jsonData.contributors.forEach((contributor: any) => {
            this.contributors?.push(new DeezerArtist(contributor));
        });

        jsonData.genres.data.forEach((genre: any) => {
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

        const trackAlbum: any = {
            id: this.id,
            title: this.title,
            cover_xl: this.cover.xl,
            cover_big: this.cover.big,
            cover_medium: this.cover.medium,
            cover_small: this.cover.small,
            release_date: jsonData.release_date
        };
        jsonData.tracks.data.forEach((track: any) => {
            track.album = trackAlbum;
            this.tracks.push(new DeezerTrack(track, true));
        });

        return this;
    }

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
/**
 * Class for Deezer Albums
 */
export class DeezerPlaylist {
    id: number;
    title: string;
    public: boolean;
    url: string;
    picture: DeezerImage;
    creationDate: Date;
    type: 'track' | 'playlist' | 'album';
    creator: DeezerUser;
    tracksCount: number;

    partial: boolean;

    description?: string;
    durationInSec?: number;
    isLoved?: boolean;
    collaborative?: boolean;
    fans?: number;

    tracks: DeezerTrack[];

    constructor(data: any, partial: boolean) {
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
        } else {
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
                this.tracks = data.tracks.data.map((track: any) => {
                    return new DeezerTrack(track, true);
                });
            }
        }
    }

    /**
     * Fetches the missing data for a partial {@link DeezerPlaylist} as well as fetching all tracks.
     * @returns The Deezer playlist object this method was called on.
     */
    async fetch(): Promise<DeezerPlaylist> {
        if (!this.partial && (this.tracks.length === this.tracksCount || !this.public)) {
            return this;
        }

        if (this.partial) {
            const response = await request(`https://api.deezer.com/playlist/${this.id}/`).catch((err: Error) => err);

            if (response instanceof Error) throw response;
            const jsonData = JSON.parse(response);

            this.partial = false;

            this.description = jsonData.description;
            this.durationInSec = jsonData.duration;
            this.isLoved = jsonData.is_loved_track;
            this.collaborative = jsonData.collaborative;
            this.fans = jsonData.fans;

            if (this.public) {
                this.tracks = jsonData.tracks.data.map((track: any) => {
                    return new DeezerTrack(track, true);
                });
            }
        }

        const currentTracksCount = this.tracks.length;
        if (this.public && currentTracksCount !== this.tracksCount) {
            let missing = this.tracksCount - currentTracksCount;

            if (missing > 1000) missing = 1000;

            const promises: Promise<DeezerTrack[]>[] = [];
            for (let i = 1; i <= Math.ceil(missing / 100); i++) {
                promises.push(
                    new Promise(async (resolve, reject) => {
                        const response = await request(
                            `https://api.deezer.com/playlist/${this.id}/tracks?limit=100&index=${i * 100}`
                        ).catch((err) => reject(err));

                        if (typeof response !== 'string') return;
                        const jsonData = JSON.parse(response);
                        const tracks = jsonData.data.map((track: any) => {
                            return new DeezerTrack(track, true);
                        });

                        resolve(tracks);
                    })
                );
            }

            const results = await Promise.allSettled(promises);
            const newTracks: DeezerTrack[] = [];

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    newTracks.push(...result.value);
                } else {
                    throw result.reason;
                }
            }

            this.tracks.push(...newTracks);
        }

        return this;
    }

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

class DeezerTrackAlbum {
    id: number;
    title: string;
    url: string;
    cover: DeezerImage;
    releaseDate?: Date;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
        this.url = `https://www.deezer.com/album/${data.id}/`;
        this.cover = {
            xl: data.cover_xl,
            big: data.cover_big,
            medium: data.cover_medium,
            small: data.cover_small
        };

        if (data.release_date) this.releaseDate = new Date(data.release_date);
    }
}

class DeezerArtist {
    id: number;
    name: string;
    url: string;
    picture?: DeezerImage;
    role?: string;

    constructor(data: any) {
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

        if (data.role) this.role = data.role;
    }
}
