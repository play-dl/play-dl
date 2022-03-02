import { Continuation } from './Playlist';
import { SpotifyArtist, SpotifyThumbnail, SpotifyTrack } from './Track';

export class SpotifyAlbum {
    id: string;
    name: string;
    url: string;
    type: 'album';
    thumbnails: SpotifyThumbnail;
    artists: SpotifyArtist[];
    copyright: {
        type: string;
        text: string;
    };
    release_date: string;
    release_date_precision: string;
    tracksCount: number;
    private continuation: Continuation;
    private fetched_tracks: Map<number, SpotifyTrack[]>;
    constructor(data: any, continuation: Continuation) {
        this.name = data.name;
        this.type = 'album';
        this.id = data.id;
        this.url = data.external_urls.spotify;
        this.continuation = continuation;
        this.thumbnails = data.images ?? [];
        const artists: SpotifyArtist[] = [];
        data.artists?.forEach((v: any) => {
            artists.push({
                name: v.name,
                id: v.id,
                url: v.external_urls.spotify
            });
        });
        this.artists = artists;
        this.copyright = data.copyright;
        this.release_date = data.release_date;
        this.release_date_precision = data.release_date_precision;
        this.tracksCount = data.tracksCount;
        const videos: SpotifyTrack[] = [];
        data.tracks?.items?.forEach((v: any) => {
            videos.push(new SpotifyTrack(v));
        });
        this.fetched_tracks = new Map();
        this.fetched_tracks.set(1, videos);
    }

    toString() {
        return this.name;
    }

    toJSON(): SpotifyAlbumJSON {
        return {
            name: this.name,
            id: this.id,
            url: this.url,
            thumbnails: this.thumbnails,
            artists: this.artists,
            copyright: this.copyright,
            release_date: this.release_date,
            release_date_precision: this.release_date_precision,
            tracksCount: this.tracksCount
        };
    }
}

interface SpotifyAlbumJSON {
    id: string;
    name: string;
    url: string;
    thumbnails: SpotifyThumbnail;
    artists: SpotifyArtist[];
    copyright: {
        type: string;
        text: string;
    };
    release_date: string;
    release_date_precision: string;
    tracksCount: number;
}
