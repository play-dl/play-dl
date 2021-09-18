import { Channel } from './Channel';
import { Thumbnail } from './Thumbnail';

interface VideoOptions {
    id?: string;
    url?: string;
    title?: string;
    description?: string;
    durationRaw: string;
    durationInSec: number;
    uploadedAt?: string;
    views: number;
    thumbnail?: {
        id: string | undefined;
        width: number | undefined;
        height: number | undefined;
        url: string | undefined;
    };
    channel?: {
        name: string;
        id: string;
        icon: string;
    };
    videos?: Video[];
    type: string;
    ratings: {
        likes: number;
        dislikes: number;
    };
    live: boolean;
    private: boolean;
    tags: string[];
}

export class Video {
    id?: string;
    url?: string;
    title?: string;
    description?: string;
    durationRaw: string;
    durationInSec: number;
    uploadedAt?: string;
    views: number;
    thumbnail?: {
        id: string | undefined;
        width: number | undefined;
        height: number | undefined;
        url: string | undefined;
    };
    channel?: Channel;
    videos?: Video[];
    likes: number;
    dislikes: number;
    live: boolean;
    private: boolean;
    tags: string[];

    constructor(data: any) {
        if (!data) throw new Error(`Can not initiate ${this.constructor.name} without data`);

        this.id = data.id || undefined;
        this.url = `https://www.youtube.com/watch?v=${this.id}`;
        this.title = data.title || undefined;
        this.description = data.description || undefined;
        this.durationRaw = data.duration_raw || '0:00';
        this.durationInSec = (data.duration < 0 ? 0 : data.duration) || 0;
        this.uploadedAt = data.uploadedAt || undefined;
        this.views = parseInt(data.views) || 0;
        this.thumbnail = data.thumbnail || {};
        this.channel = data.channel || {};
        this.likes = (data.ratings?.likes as number) || 0;
        this.dislikes = data.ratings?.dislikes || 0;
        this.live = !!data.live;
        this.private = !!data.private;
        this.tags = data.tags || [];
    }

    get type(): 'video' {
        return 'video';
    }

    get toString(): string {
        return this.url || '';
    }

    get toJSON(): VideoOptions {
        return {
            id: this.id,
            url: this.url,
            title: this.title,
            description: this.description,
            durationInSec: this.durationInSec,
            durationRaw: this.durationRaw,
            uploadedAt: this.uploadedAt,
            thumbnail: this.thumbnail,
            channel: {
                name: this.channel?.name as string,
                id: this.channel?.id as string,
                icon: this.channel?.iconURL() as string
            },
            views: this.views,
            type: this.type,
            tags: this.tags,
            ratings: {
                likes: this.likes,
                dislikes: this.dislikes
            },
            live: this.live,
            private: this.private
        };
    }
}
