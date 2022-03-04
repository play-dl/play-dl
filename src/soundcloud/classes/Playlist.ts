import { SoundCloudTrack, SoundCloudUser } from './Track';

export interface SoundCloudTrackDeprecated {
    id: number;
    type: 'track';
    fetched: boolean;
}

export class SoundCloudPlaylist {
    id: number;
    name: string;
    url: string;
    type: 'playlist';
    sub_type: string;
    durationInSec: number;
    durationInMs: number;
    user: SoundCloudUser;
    tracks: SoundCloudTrack[] | SoundCloudTrackDeprecated[];
    tracksCount: number;
    private continuation: string;

    constructor(data: any) {
        this.name = data.title;
        this.id = data.id;
        this.url = data.uri;
        this.continuation = data.continuation;
        this.type = 'playlist';
        this.sub_type = data.set_type;
        this.durationInSec = Math.round(Number(data.duration) / 1000);
        this.durationInMs = Number(data.duration);
        this.user = {
            name: data.user.username,
            id: data.user.id,
            type: 'user',
            url: data.user.permalink_url,
            verified: Boolean(data.user.verified) || false,
            description: data.user.description,
            first_name: data.user.first_name,
            full_name: data.user.full_name,
            last_name: data.user.last_name,
            thumbnail: data.user.avatar_url
        };
        this.tracksCount = data.track_count;
        const tracks: any[] = [];
        data.tracks?.forEach((track: any) => {
            if (track.title) {
                tracks.push(new SoundCloudTrack(track));
            } else
                tracks.push({
                    id: track.id,
                    fetched: false,
                    type: 'track'
                });
        });
        this.tracks = tracks;
    }

    toJSON(): PlaylistJSON {
        return {
            name: this.name,
            id: this.id,
            sub_type: this.sub_type,
            url: this.url,
            durationInMs: this.durationInMs,
            durationInSec: this.durationInSec,
            tracksCount: this.tracksCount,
            user: this.user,
            tracks: this.tracks
        };
    }
}

export interface PlaylistJSON {
    id: number;
    name: string;
    url: string;
    sub_type: string;
    durationInSec: number;
    durationInMs: number;
    user: SoundCloudUser;
    tracks: SoundCloudTrack[] | SoundCloudTrackDeprecated[];
    tracksCount: number;
}
