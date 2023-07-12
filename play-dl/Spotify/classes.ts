import { request } from '../Request';
import { SpotifyDataOptions } from '.';
import { AlbumJSON, PlaylistJSON, TrackJSON } from './constants';

export interface SpotifyTrackAlbum {
    /**
     * Spotify Track Album name
     */
    name: string;
    /**
     * Spotify Track Album url
     */
    url: string;
    /**
     * Spotify Track Album id
     */
    id: string;
    /**
     * Spotify Track Album release date
     */
    release_date: string;
    /**
     * Spotify Track Album release date **precise**
     */
    release_date_precision: string;
    /**
     * Spotify Track Album total tracks number
     */
    total_tracks: number;
}

export interface SpotifyArtists {
    /**
     * Spotify Artist Name
     */
    name: string;
    /**
     * Spotify Artist Url
     */
    url: string;
    /**
     * Spotify Artist ID
     */
    id: string;
}

export interface SpotifyThumbnail {
    /**
     * Spotify Thumbnail height
     */
    height: number;
    /**
     * Spotify Thumbnail width
     */
    width: number;
    /**
     * Spotify Thumbnail url
     */
    url: string;
}

export interface SpotifyCopyright {
    /**
     * Spotify Copyright Text
     */
    text: string;
    /**
     * Spotify Copyright Type
     */
    type: string;
}
/**
 * Spotify Track Class
 */
export class SpotifyTrack {
    /**
     * Spotify Track Name
     */
    name: string;
    /**
     * Spotify Class type. == "track"
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * Spotify Track ID
     */
    id: string;
    /**
     * Spotify Track ISRC
     */
    isrc: string;
    /**
     * Spotify Track url
     */
    url: string;
    /**
     * Spotify Track explicit info.
     */
    explicit: boolean;
    /**
     * Spotify Track playability info.
     */
    playable: boolean;
    /**
     * Spotify Track Duration in seconds
     */
    durationInSec: number;
    /**
     * Spotify Track Duration in milli seconds
     */
    durationInMs: number;
    /**
     * Spotify Track Artists data [ array ]
     */
    artists: SpotifyArtists[];
    /**
     * Spotify Track Album data
     */
    album: SpotifyTrackAlbum | undefined;
    /**
     * Spotify Track Thumbnail Data
     */
    thumbnail: SpotifyThumbnail | undefined;
    /**
     * Constructor for Spotify Track
     * @param data
     */
    constructor(data: any) {
        this.name = data.name;
        this.id = data.id;
        this.isrc = data.external_ids?.isrc || '';
        this.type = 'track';
        this.url = data.external_urls.spotify;
        this.explicit = data.explicit;
        this.playable = data.is_playable;
        this.durationInMs = data.duration_ms;
        this.durationInSec = Math.round(this.durationInMs / 1000);
        const artists: SpotifyArtists[] = [];
        data.artists.forEach((v: any) => {
            artists.push({
                name: v.name,
                id: v.id,
                url: v.external_urls.spotify
            });
        });
        this.artists = artists;
        if (!data.album?.name) this.album = undefined;
        else {
            this.album = {
                name: data.album.name,
                url: data.external_urls.spotify,
                id: data.album.id,
                release_date: data.album.release_date,
                release_date_precision: data.album.release_date_precision,
                total_tracks: data.album.total_tracks
            };
        }
        if (!data.album?.images?.[0]) this.thumbnail = undefined;
        else this.thumbnail = data.album.images[0];
    }

    toJSON(): TrackJSON {
        return {
            name: this.name,
            id: this.id,
            url: this.url,
            explicit: this.explicit,
            durationInMs: this.durationInMs,
            durationInSec: this.durationInSec,
            artists: this.artists,
            album: this.album,
            thumbnail: this.thumbnail
        };
    }
}
/**
 * Spotify Playlist Class
 */
export class SpotifyPlaylist {
    /**
     * Spotify Playlist Name
     */
    name: string;
    /**
     * Spotify Class type. == "playlist"
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * Spotify Playlist collaborative boolean.
     */
    collaborative: boolean;
    /**
     * Spotify Playlist Description
     */
    description: string;
    /**
     * Spotify Playlist URL
     */
    url: string;
    /**
     * Spotify Playlist ID
     */
    id: string;
    /**
     * Spotify Playlist Thumbnail Data
     */
    thumbnail: SpotifyThumbnail;
    /**
     * Spotify Playlist Owner Artist data
     */
    owner: SpotifyArtists;
    /**
     * Spotify Playlist total tracks Count
     */
    tracksCount: number;
    /**
     * Spotify Playlist Spotify data
     *
     * @private
     */
    private spotifyData: SpotifyDataOptions;
    /**
     * Spotify Playlist fetched tracks Map
     *
     * @private
     */
    private fetched_tracks: Map<string, SpotifyTrack[]>;
    /**
     * Boolean to tell whether it is a searched result or not.
     */
    private readonly search: boolean;
    /**
     * Constructor for Spotify Playlist Class
     * @param data JSON parsed data of playlist
     * @param spotifyData Data about sporify token for furhter fetching.
     */
    constructor(data: any, spotifyData: SpotifyDataOptions, search: boolean) {
        this.name = data.name;
        this.type = 'playlist';
        this.search = search;
        this.collaborative = data.collaborative;
        this.description = data.description;
        this.url = data.external_urls.spotify;
        this.id = data.id;
        this.thumbnail = data.images[0];
        this.owner = {
            name: data.owner.display_name,
            url: data.owner.external_urls.spotify,
            id: data.owner.id
        };
        this.tracksCount = Number(data.tracks.total);
        const videos: SpotifyTrack[] = [];
        if (!this.search)
            data.tracks.items.forEach((v: any) => {
                if (v.track) videos.push(new SpotifyTrack(v.track));
            });
        this.fetched_tracks = new Map();
        this.fetched_tracks.set('1', videos);
        this.spotifyData = spotifyData;
    }
    /**
     * Fetches Spotify Playlist tracks more than 100 tracks.
     *
     * For getting all tracks in playlist, see `total_pages` property.
     * @returns Playlist Class.
     */
    async fetch() {
        if (this.search) return this;
        let fetching: number;
        if (this.tracksCount > 1000) fetching = 1000;
        else fetching = this.tracksCount;
        if (fetching <= 100) return this;
        const work = [];
        for (let i = 2; i <= Math.ceil(fetching / 100); i++) {
            work.push(
                new Promise(async (resolve, reject) => {
                    const response = await request(
                        `https://api.spotify.com/v1/playlists/${this.id}/tracks?offset=${
                            (i - 1) * 100
                        }&limit=100&market=${this.spotifyData.market}`,
                        {
                            headers: {
                                Authorization: `${this.spotifyData.token_type} ${this.spotifyData.access_token}`
                            }
                        }
                    ).catch((err) => reject(`Response Error : \n${err}`));
                    const videos: SpotifyTrack[] = [];
                    if (typeof response !== 'string') return;
                    const json_data = JSON.parse(response);
                    json_data.items.forEach((v: any) => {
                        if (v.track) videos.push(new SpotifyTrack(v.track));
                    });
                    this.fetched_tracks.set(`${i}`, videos);
                    resolve('Success');
                })
            );
        }
        await Promise.allSettled(work);
        return this;
    }
    /**
     * Spotify Playlist tracks are divided in pages.
     *
     * For example getting data of 101 - 200 videos in a playlist,
     *
     * ```ts
     * const playlist = await play.spotify('playlist url')
     *
     * await playlist.fetch()
     *
     * const result = playlist.page(2)
     * ```
     * @param num Page Number
     * @returns
     */
    page(num: number) {
        if (!num) throw new Error('Page number is not provided');
        if (!this.fetched_tracks.has(`${num}`)) throw new Error('Given Page number is invalid');
        return this.fetched_tracks.get(`${num}`) as SpotifyTrack[];
    }
    /**
     * Gets total number of pages in that playlist class.
     * @see {@link SpotifyPlaylist.all_tracks}
     */
    get total_pages() {
        return this.fetched_tracks.size;
    }
    /**
     * Spotify Playlist total no of tracks that have been fetched so far.
     */
    get total_tracks() {
        if (this.search) return this.tracksCount;
        const page_number: number = this.total_pages;
        return (page_number - 1) * 100 + (this.fetched_tracks.get(`${page_number}`) as SpotifyTrack[]).length;
    }
    /**
     * Fetches all the tracks in the playlist and returns them
     *
     * ```ts
     * const playlist = await play.spotify('playlist url')
     *
     * const tracks = await playlist.all_tracks()
     * ```
     * @returns An array of {@link SpotifyTrack}
     */
    async all_tracks(): Promise<SpotifyTrack[]> {
        await this.fetch();

        const tracks: SpotifyTrack[] = [];

        for (const page of this.fetched_tracks.values()) tracks.push(...page);

        return tracks;
    }
    /**
     * Converts Class to JSON
     * @returns JSON data
     */
    toJSON(): PlaylistJSON {
        return {
            name: this.name,
            collaborative: this.collaborative,
            description: this.description,
            url: this.url,
            id: this.id,
            thumbnail: this.thumbnail,
            owner: this.owner,
            tracksCount: this.tracksCount
        };
    }
}
/**
 * Spotify Album Class
 */
export class SpotifyAlbum {
    /**
     * Spotify Album Name
     */
    name: string;
    /**
     * Spotify Class type. == "album"
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * Spotify Album url
     */
    url: string;
    /**
     * Spotify Album id
     */
    id: string;
    /**
     * Spotify Album Thumbnail data
     */
    thumbnail: SpotifyThumbnail;
    /**
     * Spotify Album artists [ array ]
     */
    artists: SpotifyArtists[];
    /**
     * Spotify Album copyright data [ array ]
     */
    copyrights: SpotifyCopyright[];
    /**
     * Spotify Album Release date
     */
    release_date: string;
    /**
     * Spotify Album Release Date **precise**
     */
    release_date_precision: string;
    /**
     * Spotify Album total no of tracks
     */
    tracksCount: number;
    /**
     * Spotify Album Spotify data
     *
     * @private
     */
    private spotifyData: SpotifyDataOptions;
    /**
     * Spotify Album fetched tracks Map
     *
     * @private
     */
    private fetched_tracks: Map<string, SpotifyTrack[]>;
    /**
     * Boolean to tell whether it is a searched result or not.
     */
    private readonly search: boolean;
    /**
     * Constructor for Spotify Album Class
     * @param data Json parsed album data
     * @param spotifyData Spotify credentials
     */
    constructor(data: any, spotifyData: SpotifyDataOptions, search: boolean) {
        this.name = data.name;
        this.type = 'album';
        this.id = data.id;
        this.search = search;
        this.url = data.external_urls.spotify;
        this.thumbnail = data.images[0];
        const artists: SpotifyArtists[] = [];
        data.artists.forEach((v: any) => {
            artists.push({
                name: v.name,
                id: v.id,
                url: v.external_urls.spotify
            });
        });
        this.artists = artists;
        this.copyrights = data.copyrights;
        this.release_date = data.release_date;
        this.release_date_precision = data.release_date_precision;
        this.tracksCount = data.total_tracks;
        const videos: SpotifyTrack[] = [];
        if (!this.search)
            data.tracks.items.forEach((v: any) => {
                videos.push(new SpotifyTrack(v));
            });
        this.fetched_tracks = new Map();
        this.fetched_tracks.set('1', videos);
        this.spotifyData = spotifyData;
    }
    /**
     * Fetches Spotify Album tracks more than 50 tracks.
     *
     * For getting all tracks in album, see `total_pages` property.
     * @returns Album Class.
     */
    async fetch() {
        if (this.search) return this;
        let fetching: number;
        if (this.tracksCount > 500) fetching = 500;
        else fetching = this.tracksCount;
        if (fetching <= 50) return this;
        const work = [];
        for (let i = 2; i <= Math.ceil(fetching / 50); i++) {
            work.push(
                new Promise(async (resolve, reject) => {
                    const response = await request(
                        `https://api.spotify.com/v1/albums/${this.id}/tracks?offset=${(i - 1) * 50}&limit=50&market=${
                            this.spotifyData.market
                        }`,
                        {
                            headers: {
                                Authorization: `${this.spotifyData.token_type} ${this.spotifyData.access_token}`
                            }
                        }
                    ).catch((err) => reject(`Response Error : \n${err}`));
                    const videos: SpotifyTrack[] = [];
                    if (typeof response !== 'string') return;
                    const json_data = JSON.parse(response);
                    json_data.items.forEach((v: any) => {
                        if (v) videos.push(new SpotifyTrack(v));
                    });
                    this.fetched_tracks.set(`${i}`, videos);
                    resolve('Success');
                })
            );
        }
        await Promise.allSettled(work);
        return this;
    }
    /**
     * Spotify Album tracks are divided in pages.
     *
     * For example getting data of 51 - 100 videos in a album,
     *
     * ```ts
     * const album = await play.spotify('album url')
     *
     * await album.fetch()
     *
     * const result = album.page(2)
     * ```
     * @param num Page Number
     * @returns
     */
    page(num: number) {
        if (!num) throw new Error('Page number is not provided');
        if (!this.fetched_tracks.has(`${num}`)) throw new Error('Given Page number is invalid');
        return this.fetched_tracks.get(`${num}`);
    }
    /**
     * Gets total number of pages in that album class.
     * @see {@link SpotifyAlbum.all_tracks}
     */
    get total_pages() {
        return this.fetched_tracks.size;
    }
    /**
     * Spotify Album total no of tracks that have been fetched so far.
     */
    get total_tracks() {
        if (this.search) return this.tracksCount;
        const page_number: number = this.total_pages;
        return (page_number - 1) * 100 + (this.fetched_tracks.get(`${page_number}`) as SpotifyTrack[]).length;
    }
    /**
     * Fetches all the tracks in the album and returns them
     *
     * ```ts
     * const album = await play.spotify('album url')
     *
     * const tracks = await album.all_tracks()
     * ```
     * @returns An array of {@link SpotifyTrack}
     */
    async all_tracks(): Promise<SpotifyTrack[]> {
        await this.fetch();

        const tracks: SpotifyTrack[] = [];

        for (const page of this.fetched_tracks.values()) tracks.push(...page);

        return tracks;
    }
    /**
     * Converts Class to JSON
     * @returns JSON data
     */
    toJSON(): AlbumJSON {
        return {
            name: this.name,
            id: this.id,
            type: this.type,
            url: this.url,
            thumbnail: this.thumbnail,
            artists: this.artists,
            copyrights: this.copyrights,
            release_date: this.release_date,
            release_date_precision: this.release_date_precision,
            tracksCount: this.tracksCount
        };
    }
}
