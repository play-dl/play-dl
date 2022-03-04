import { DeezerImage, DeezerTrack, DeezerUser } from './Track';

export class DeezerPlaylist {
    id: number;
    title: string;
    public: boolean;
    url: string;
    picture: DeezerImage;
    creationDate: Date;
    type: 'playlist';
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

    toJSON(): PlaylistJSON {
        return {
            id: this.id,
            title: this.title,
            public: this.public,
            url: this.url,
            picture: this.picture,
            creationDate: this.creationDate,
            partial: this.partial,
            creator: this.creator,
            tracksCount: this.tracksCount,
            description: this.description,
            durationInSec: this.durationInSec,
            isLoved: this.isLoved,
            collaborative: this.collaborative,
            fans: this.fans,
            tracks: this.tracks
        };
    }
}

export interface PlaylistJSON {
    id: number;
    title: string;
    public: boolean;
    url: string;
    picture: DeezerImage;
    creationDate: Date;
    creator: DeezerUser;
    tracksCount: number;
    partial: boolean;
    description?: string;
    durationInSec?: number;
    isLoved?: boolean;
    collaborative?: boolean;
    fans?: number;
    tracks: DeezerTrack[];
}
