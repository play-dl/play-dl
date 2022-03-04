import { DeezerTrackAlbum } from './Album';
import { DeezerArtist } from './Artist';

export interface DeezerImage {
    xl: string;
    big: string;
    medium: string;
    small: string;
}

export interface DeezerImage {
    xl: string;
    big: string;
    medium: string;
    small: string;
}

export interface DeezerGenre {
    name: string;
    picture: DeezerImage;
}

export interface DeezerUser {
    id: number;
    name: string;
}

export class DeezerTrack {
    id: number;
    title: string;
    type: 'track';
    shortTitle: string;
    url: string;
    durationInSec: number;
    rank: number;
    explicit: boolean;
    previewURL: string;
    artist?: DeezerArtist;
    album?: DeezerTrackAlbum;
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
        this.artist = data.artist ? new DeezerArtist(data.artist) : undefined;
        this.album = data.album ? new DeezerTrackAlbum(data.album) : undefined;
        this.type = 'track';

        this.partial = partial;

        if (!partial) {
            this.trackPosition = data.track_position;
            this.diskNumber = data.disk_number;
            this.releaseDate = data.release_date ? new Date(data.release_date) : undefined;
            this.bpm = data.bpm;
            this.gain = data.gain;
            this.contributors = [];

            data.contributors?.forEach((contributor: any) => {
                this.contributors?.push(new DeezerArtist(contributor));
            });
        }
    }

    toJSON(): TrackJSON {
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
            partial: this.partial,
            trackPosition: this.trackPosition,
            diskNumber: this.diskNumber,
            releaseDate: this.releaseDate,
            bpm: this.bpm,
            gain: this.gain,
            contributors: this.contributors
        };
    }
}

export interface TrackJSON {
    id: number;
    title: string;
    shortTitle: string;
    url: string;
    durationInSec: number;
    rank: number;
    explicit: boolean;
    previewURL: string;
    artist?: DeezerArtist;
    album?: DeezerTrackAlbum;
    partial: boolean;
    trackPosition?: number;
    diskNumber?: number;
    releaseDate?: Date;
    bpm?: number;
    gain?: number;
    contributors?: DeezerArtist[];
}
