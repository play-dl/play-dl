import { DeezerArtist } from './Artist';
import { DeezerGenre, DeezerImage, DeezerTrack } from './Track';

export class DeezerAlbum {
    id: number;
    title: string;
    type: 'album';
    url: string;
    recordType: string;
    explicit: boolean;
    artist?: DeezerArtist;
    cover: DeezerImage;
    tracksCount: number;
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
        this.type = 'album';
        this.url = data.link;
        this.recordType = data.record_type;
        this.explicit = data.explicit_lyrics;
        this.artist = data.artist ? new DeezerArtist(data.artist) : undefined;
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
            this.releaseDate = data.release_date ? new Date(data.release_date) : undefined;
            this.available = data.available;

            data.contributors?.forEach((contributor: any) => {
                this.contributors?.push(new DeezerArtist(contributor));
            });

            data.genres?.data?.forEach((genre: any) => {
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
            data.tracks?.data?.forEach((track: any) => {
                track.album = trackAlbum;
                this.tracks.push(new DeezerTrack(track, true));
            });
        }
    }

    toJSON(): AlbumJSON {
        return {
            id: this.id,
            title: this.title,
            url: this.url,
            recordType: this.recordType,
            explicit: this.explicit,
            artist: this.artist,
            cover: this.cover,
            partial: this.partial,
            upc: this.upc,
            tracksCount: this.tracksCount,
            durationInSec: this.durationInSec,
            numberOfFans: this.numberOfFans,
            releaseDate: this.releaseDate,
            available: this.available,
            genres: this.genres,
            contributors: this.contributors,
            tracks: this.tracks
        };
    }
}

export interface AlbumJSON {
    id: number;
    title: string;
    url: string;
    recordType: string;
    explicit: boolean;
    artist?: DeezerArtist;
    cover: DeezerImage;
    tracksCount: number;
    partial: boolean;
    upc?: string;
    durationInSec?: number;
    numberOfFans?: number;
    releaseDate?: Date;
    available?: boolean;
    genres?: DeezerGenre[];
    contributors?: DeezerArtist[];
    tracks: DeezerTrack[];
}

export class DeezerTrackAlbum {
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
