export interface SpotifyArtist {
    id: string;
    name: string;
    url: string;
}

export interface SpotifyTrackAlbum {
    id: string;
    name: string;
    url: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
}

export interface SpotifyThumbnail {
    url: string;
    height: number;
    width: number;
}

export class SpotifyTrack {
    id: string;
    name: string;
    type: 'track';
    url: string;
    explicit: boolean;
    durationInSec: number;
    durationInMs: number;
    artists: SpotifyArtist[];
    album: SpotifyTrackAlbum | undefined;
    thumbnails: SpotifyThumbnail[];
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.type = 'track';
        this.url = data.url;
        this.explicit = data.explicit;
        this.durationInSec = data.durationInSec;
        this.durationInMs = data.durationInMs;
        const artists: SpotifyArtist[] = [];
        data.artists?.forEach((v: any) => {
            artists.push({
                name: v.name,
                id: v.id,
                url: v.external_urls.spotify
            });
        });
        this.artists = artists;
        if (!data.album?.name) this.album = undefined;
        else
            this.album = {
                name: data.album.name,
                url: data.external_urls.spotify,
                id: data.album.id,
                release_date: data.album.release_date,
                release_date_precision: data.album.release_date_precision,
                total_tracks: data.album.total_tracks
            };
        this.thumbnails = data.album?.images ?? [];
    }

    toString() {
        return this.name;
    }

    toJSON(): SpotifyTrackJSON {
        return {
            name: this.name,
            id: this.id,
            url: this.url,
            explicit: this.explicit,
            durationInMs: this.durationInMs,
            durationInSec: this.durationInSec,
            artists: this.artists,
            album: this.album,
            thumbnails: this.thumbnails
        };
    }
}

interface SpotifyTrackJSON {
    id: string;
    name: string;
    url: string;
    explicit: boolean;
    durationInSec: number;
    durationInMs: number;
    artists: SpotifyArtist[];
    album: SpotifyTrackAlbum | undefined;
    thumbnails: SpotifyThumbnail[];
}
