import { YouTubeChannel } from './Channel';
import { YouTubeThumbnail } from './Thumbnail';
import { YouTubeVideo } from './Video';

//const BASE_API = 'https://www.youtube.com/youtubei/v1/browse?key=';

interface continuationToken {
    api?: string;
    token?: string;
    clientVersion?: string;
}

export class YouTubePlayList {
    id: string;
    title: string;
    url: string;
    type: 'playlist';
    videoCount: number;
    lastUpdate: Date | null;
    views: number;
    channel: YouTubeChannel | null;
    thumbnails: YouTubeThumbnail[];
    private fetched_videos: Map<number, YouTubeVideo[]>;
    private continuation: continuationToken;
    constructor(data: Omit<playlistOptions, 'type'>) {
        this.id = data.id;
        this.title = data.title;
        this.url = data.url;
        this.type = 'playlist';
        this.videoCount = data.videoCount;
        this.lastUpdate = data.lastUpdate ? new Date(data.lastUpdate) : null;
        this.views = data.views;
        this.channel = data.channel ? new YouTubeChannel(data.channel) : null;
        const thumbnails: YouTubeThumbnail[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.thumbnails?.forEach((x: any) => thumbnails.push(new YouTubeThumbnail(x)));
        this.thumbnails = thumbnails;
        this.fetched_videos = new Map();
        this.continuation = data.continuation ?? {};
    }

    private next(limit = Infinity) {
        return limit;
    }
}

interface playlistOptions {
    id: string;
    title: string;
    url: string;
    type: 'playlist';
    videoCount: number;
    lastUpdate: Date | null;
    views: number;
    channel: YouTubeChannel | null;
    thumbnails: YouTubeThumbnail[];
    continuation: continuationToken;
}
