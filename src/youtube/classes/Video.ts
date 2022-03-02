import { YouTubeChannel } from './Channel';
import { YouTubeThumbnail } from './Thumbnail';

export class YouTubeVideo {
    id: string;
    url: string;
    title: string;
    type: 'video';
    description: string;
    durationRaw: string;
    durationInSec: number;
    uploadedAt: Date | null;
    liveAt: Date | null;
    upcoming: Date | null;
    views: number;
    thumbnails: YouTubeThumbnail[];
    channel: YouTubeChannel | null;
    likes: number;
    live: boolean;
    private: boolean;
    tags: string[];
    discretionAdvised: boolean;
    constructor(data: Omit<YouTubeVideoOptions, 'type'>) {
        this.id = data.id;
        this.url = data.url;
        this.type = 'video';
        this.title = data.title;
        this.description = data.description;
        this.durationRaw = data.durationRaw;
        this.durationInSec = data.durationInSec;
        this.uploadedAt = data.uploadedAt ? new Date(data.uploadedAt) : null;
        this.liveAt = data.liveAt ? new Date(data.liveAt) : null;
        this.upcoming = data.upcoming ? new Date(data.upcoming) : null;
        this.views = data.views;
        const thumbnails: YouTubeThumbnail[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.thumbnails.forEach((x: any) => thumbnails.push(new YouTubeThumbnail(x)));
        this.thumbnails = thumbnails;
        this.channel = data.channel ? new YouTubeChannel(data.channel) : null;
        this.likes = data.likes;
        this.live = !!data.live;
        this.private = !!data.private;
        this.tags = data.tags;
        this.discretionAdvised = !!data.discretionAdvised;
    }

    toString() {
        return this.title;
    }

    toJSON(): YouTubeVideoOptions {
        return {
            id: this.id,
            url: this.url,
            type: 'video',
            title: this.title,
            description: this.description,
            durationInSec: this.durationInSec,
            durationRaw: this.durationRaw,
            uploadedAt: this.uploadedAt,
            thumbnails: this.thumbnails,
            channel: this.channel,
            views: this.views,
            tags: this.tags,
            likes: this.likes,
            live: this.live,
            private: this.private,
            discretionAdvised: this.discretionAdvised,
            liveAt: this.liveAt,
            upcoming: this.upcoming
        };
    }
}

interface YouTubeVideoOptions {
    id: string;
    url: string;
    title: string;
    type: 'video';
    description: string;
    durationRaw: string;
    durationInSec: number;
    uploadedAt: Date | null;
    liveAt: Date | null;
    upcoming: Date | null;
    views: number;
    thumbnails: YouTubeThumbnail[];
    channel: YouTubeChannel | null;
    likes: number;
    live: boolean;
    private: boolean;
    tags: string[];
    discretionAdvised: boolean;
}
