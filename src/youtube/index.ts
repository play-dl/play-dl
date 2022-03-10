import { YouTubeChannel } from './classes/Channel';
import { YouTubePlayList } from './classes/Playlist';
import { YouTubeThumbnail } from './classes/Thumbnail';
import { YouTubeVideo } from './classes/Video';

export type YouTube = YouTubeChannel | YouTubePlayList | YouTubeThumbnail | YouTubeVideo;

let youtube_manager_count = 0;

export class YouTubeManager {
    id: number;

    constructor() {
        this.id = ++youtube_manager_count;
    }

    search(term: string): YouTubeResult {
        return {};
    }

    page(): YouTubeResult {
        return {};
    }
}

interface YouTubeResult {
    error?: Error;
    data?: YouTube;
}
