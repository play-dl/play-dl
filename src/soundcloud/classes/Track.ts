export interface SoundCloudUser {
    id: string;
    name: string;
    url: string;
    type: 'user';
    verified: boolean;
    description: string;
    first_name: string;
    full_name: string;
    last_name: string;
    thumbnail: string;
}

export interface SoundCloudTrackFormat {
    url: string;
    preset: string;
    duration: number;
    format: {
        protocol: string;
        mime_type: string;
    };
    quality: string;
}

export class SoundCloudTrack {
    id: number;
    name: string;
    url: string;
    type: 'track';
    permalink: string;
    fetched: boolean;
    durationInSec: number;
    durationInMs: number;
    formats: SoundCloudTrackFormat[];
    publisher:
        | {
              name: string;
              id: number;
              artist: string;
              contains_music: boolean;
              writer_composer: string;
          }
        | undefined;
    thumbnail: string;
    user: SoundCloudUser;
    constructor(data: any) {
        this.name = data.title;
        this.id = data.id;
        this.url = data.uri;
        this.permalink = data.permalink_url;
        this.fetched = true;
        this.type = 'track';
        this.durationInSec = Math.round(Number(data.duration) / 1000);
        this.durationInMs = Number(data.duration);
        if (data.publisher_metadata)
            this.publisher = {
                name: data.publisher_metadata.publisher,
                id: data.publisher_metadata.id,
                artist: data.publisher_metadata.artist,
                contains_music: Boolean(data.publisher_metadata.contains_music) || false,
                writer_composer: data.publisher_metadata.writer_composer
            };
        else this.publisher = undefined;
        this.formats = data.media.transcodings;
        this.user = {
            name: data.user?.username,
            id: data.user?.id,
            type: 'user',
            url: data.user?.permalink_url,
            verified: Boolean(data.user?.verified) || false,
            description: data.user?.description,
            first_name: data.user?.first_name,
            full_name: data.user?.full_name,
            last_name: data.user?.last_name,
            thumbnail: data.user?.avatar_url
        };
        this.thumbnail = data.artwork_url;
    }

    toJSON(): TrackJSON {
        return {
            name: this.name,
            id: this.id,
            url: this.url,
            permalink: this.permalink,
            fetched: this.fetched,
            durationInMs: this.durationInMs,
            durationInSec: this.durationInSec,
            publisher: this.publisher,
            formats: this.formats,
            thumbnail: this.thumbnail,
            user: this.user
        };
    }
}

export interface TrackJSON {
    id: number;
    name: string;
    url: string;
    permalink: string;
    fetched: boolean;
    durationInSec: number;
    durationInMs: number;
    formats: SoundCloudTrackFormat[];
    publisher:
        | {
              name: string;
              id: number;
              artist: string;
              contains_music: boolean;
              writer_composer: string;
          }
        | undefined;
    thumbnail: string;
    user: SoundCloudUser;
}
