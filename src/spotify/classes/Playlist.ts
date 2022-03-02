import { SpotifyArtist, SpotifyThumbnail, SpotifyTrack } from './Track';

export interface Continuation {
    token_type: string;
    access_token: string;
    market: string;
}

export class SpotifyPlaylist {
    id: string;
    type: 'playlist';
    name: string;
    url: string;
    description: string;
    collaborative: boolean;
    thumbnails: SpotifyThumbnail[];
    owner: SpotifyArtist;
    tracksCount: number;
    private continuation: Continuation;
    private fetched_tracks: Map<number, SpotifyTrack[]>;
    constructor(data: any, continuation: Continuation) {
        this.id = data.id;
        this.name = data.name;
        this.type = 'playlist';
        this.collaborative = data.collaborative;
        this.description = data.description;
        this.url = data.external_urls.spotify;
        this.thumbnails = data.images ?? [];
        this.owner = {
            name: data.owner.display_name,
            url: data.owner.external_urls.spotify,
            id: data.owner.id
        };
        this.tracksCount = Number(data.tracks.total);
        const videos: SpotifyTrack[] = [];
        data.tracks?.items?.forEach((v: any) => {
            if (v.track) videos.push(new SpotifyTrack(v.track));
        });
        this.continuation = continuation;
        this.fetched_tracks = new Map();
        this.fetched_tracks.set(1, videos);
    }

    toString() {
        return this.name;
    }

    toJSON(): SpotifyPlaylistJSON {
        return {
            name: this.name,
            collaborative: this.collaborative,
            description: this.description,
            url: this.url,
            id: this.id,
            thumbnails: this.thumbnails,
            owner: this.owner,
            tracksCount: this.tracksCount
        };
    }
}

interface SpotifyPlaylistJSON {
    id: string;
    name: string;
    url: string;
    description: string;
    collaborative: boolean;
    thumbnails: SpotifyThumbnail[];
    owner: SpotifyArtist;
    tracksCount: number;
}
