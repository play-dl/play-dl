import { request } from '../Request';
import { SpotifyDataOptions } from '.';

interface SpotifyTrackAlbum {
    name: string;
    url: string;
    id: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
}

interface SpotifyArtists {
    name: string;
    url: string;
    id: string;
}

interface SpotifyThumbnail {
    height: number;
    width: number;
    url: string;
}

interface SpotifyCopyright {
    text: string;
    type: string;
}
/**
 * Class for Spotify Track
 */
export class SpotifyTrack {
    name: string;
    type: 'track' | 'playlist' | 'album';
    id: string;
    url: string;
    explicit: boolean;
    durationInSec: number;
    durationInMs: number;
    artists: SpotifyArtists[];
    album: SpotifyTrackAlbum | undefined;
    thumbnail: SpotifyThumbnail | undefined;
    constructor(data: any) {
        this.name = data.name;
        this.id = data.id;
        this.type = 'track';
        this.url = data.external_urls.spotify;
        this.explicit = data.explicit;
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

    toJSON() {
        return {
            name: this.name,
            id: this.id,
            type: this.type,
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
 * Class for Spotify Playlist
 */
export class SpotifyPlaylist {
    name: string;
    type: 'track' | 'playlist' | 'album';
    collaborative: boolean;
    description: string;
    url: string;
    id: string;
    thumbnail: SpotifyThumbnail;
    owner: SpotifyArtists;
    tracksCount: number;
    private spotifyData: SpotifyDataOptions;
    private fetched_tracks: Map<string, SpotifyTrack[]>;
    constructor(data: any, spotifyData: SpotifyDataOptions) {
        this.name = data.name;
        this.type = 'playlist';
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
        data.tracks.items.forEach((v: any) => {
            videos.push(new SpotifyTrack(v.track));
        });
        this.fetched_tracks = new Map();
        this.fetched_tracks.set('1', videos);
        this.spotifyData = spotifyData;
    }

    async fetch() {
        let fetching: number;
        if (this.tracksCount > 1000) fetching = 1000;
        else fetching = this.tracksCount;
        if (fetching <= 100) return;
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

    page(num: number) {
        if (!num) throw new Error('Page number is not provided');
        if (!this.fetched_tracks.has(`${num}`)) throw new Error('Given Page number is invalid');
        return this.fetched_tracks.get(`${num}`);
    }

    get total_pages() {
        return this.fetched_tracks.size;
    }

    get total_tracks() {
        const page_number: number = this.total_pages;
        return (page_number - 1) * 100 + (this.fetched_tracks.get(`${page_number}`) as SpotifyTrack[]).length;
    }

    toJSON() {
        return {
            name: this.name,
            type: this.type,
            collaborative: this.collaborative,
            description: this.description,
            url: this.url,
            id: this.id,
            thumbnail: this.thumbnail,
            owner: this.owner
        };
    }
}
/**
 * Class for Spotify Album
 */
export class SpotifyAlbum {
    name: string;
    type: 'track' | 'playlist' | 'album';
    url: string;
    id: string;
    thumbnail: SpotifyThumbnail;
    artists: SpotifyArtists[];
    copyrights: SpotifyCopyright[];
    release_date: string;
    release_date_precision: string;
    tracksCount: number;
    private spotifyData: SpotifyDataOptions;
    private fetched_tracks: Map<string, SpotifyTrack[]>;
    constructor(data: any, spotifyData: SpotifyDataOptions) {
        this.name = data.name;
        this.type = 'album';
        this.id = data.id;
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
        data.tracks.items.forEach((v: any) => {
            videos.push(new SpotifyTrack(v));
        });
        this.fetched_tracks = new Map();
        this.fetched_tracks.set('1', videos);
        this.spotifyData = spotifyData;
    }

    async fetch() {
        let fetching: number;
        if (this.tracksCount > 500) fetching = 500;
        else fetching = this.tracksCount;
        if (fetching <= 50) return;
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

    page(num: number) {
        if (!num) throw new Error('Page number is not provided');
        if (!this.fetched_tracks.has(`${num}`)) throw new Error('Given Page number is invalid');
        return this.fetched_tracks.get(`${num}`);
    }

    get total_pages() {
        return this.fetched_tracks.size;
    }

    get total_tracks() {
        const page_number: number = this.total_pages;
        return (page_number - 1) * 100 + (this.fetched_tracks.get(`${page_number}`) as SpotifyTrack[]).length;
    }

    toJSON() {
        return {
            name: this.name,
            type: this.type,
            url: this.url,
            thumbnail: this.thumbnail,
            artists: this.artists,
            copyrights: this.copyrights,
            release_date: this.release_date,
            release_date_precision: this.release_date_precision,
            total_tracks: this.total_tracks
        };
    }
}
