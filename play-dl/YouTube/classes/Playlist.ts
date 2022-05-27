import { getPlaylistVideos, getContinuationToken } from '../utils/extractor';
import { request } from '../../Request';
import { YouTubeChannel } from './Channel';
import { YouTubeVideo } from './Video';
import { YouTubeThumbnail } from './Thumbnail';
const BASE_API = 'https://www.youtube.com/youtubei/v1/browse?key=';
/**
 * YouTube Playlist Class containing vital informations about playlist.
 */
export class YouTubePlayList {
    /**
     * YouTube Playlist ID
     */
    id?: string;
    /**
     * YouTube Playlist Name
     */
    title?: string;
    /**
     * YouTube Class type. == "playlist"
     */
    type: 'video' | 'playlist' | 'channel';
    /**
     * Total no of videos in that playlist
     */
    videoCount?: number;
    /**
     * Time when playlist was last updated
     */
    lastUpdate?: string;
    /**
     * Total views of that playlist
     */
    views?: number;
    /**
     * YouTube Playlist url
     */
    url?: string;
    /**
     * YouTube Playlist url with starting video url.
     */
    link?: string;
    /**
     * YouTube Playlist channel data
     */
    channel?: YouTubeChannel;
    /**
     * YouTube Playlist thumbnail Data
     */
    thumbnail?: YouTubeThumbnail;
    /**
     * Videos array containing data of first 100 videos
     */
    private videos?: YouTubeVideo[];
    /**
     * Map contaning data of all fetched videos
     */
    private fetched_videos: Map<string, YouTubeVideo[]>;
    /**
     * Token containing API key, Token, ClientVersion.
     */
    private _continuation: {
        api?: string;
        token?: string;
        clientVersion?: string;
    } = {};
    /**
     * Total no of pages count.
     */
    private __count: number;
    /**
     * Constructor for YouTube Playlist Class
     * @param data Json Parsed YouTube Playlist data
     * @param searchResult If the data is from search or not
     */
    constructor(data: any, searchResult = false) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);
        this.__count = 0;
        this.fetched_videos = new Map();
        this.type = 'playlist';
        if (searchResult) this.__patchSearch(data);
        else this.__patch(data);
    }
    /**
     * Updates variable according to a normal data.
     * @param data Json Parsed YouTube Playlist data
     */
    private __patch(data: any) {
        this.id = data.id || undefined;
        this.url = data.url || undefined;
        this.title = data.title || undefined;
        this.videoCount = data.videoCount || 0;
        this.lastUpdate = data.lastUpdate || undefined;
        this.views = data.views || 0;
        this.link = data.link || undefined;
        this.channel = new YouTubeChannel(data.channel) || undefined;
        this.thumbnail = data.thumbnail ? new YouTubeThumbnail(data.thumbnail) : undefined;
        this.videos = data.videos || [];
        this.__count++;
        this.fetched_videos.set(`${this.__count}`, this.videos as YouTubeVideo[]);
        this._continuation.api = data.continuation?.api ?? undefined;
        this._continuation.token = data.continuation?.token ?? undefined;
        this._continuation.clientVersion = data.continuation?.clientVersion ?? '<important data>';
    }
    /**
     * Updates variable according to a searched data.
     * @param data Json Parsed YouTube Playlist data
     */
    private __patchSearch(data: any) {
        this.id = data.id || undefined;
        this.url = this.id ? `https://www.youtube.com/playlist?list=${this.id}` : undefined;
        this.title = data.title || undefined;
        this.thumbnail = new YouTubeThumbnail(data.thumbnail) || undefined;
        this.channel = data.channel || undefined;
        this.videos = [];
        this.videoCount = data.videos || 0;
        this.link = undefined;
        this.lastUpdate = undefined;
        this.views = 0;
    }
    /**
     * Parses next segment of videos from playlist and returns parsed data.
     * @param limit Total no of videos to parse.
     *
     * Default = Infinity
     * @returns Array of YouTube Video Class
     */
    async next(limit = Infinity): Promise<YouTubeVideo[]> {
        if (!this._continuation || !this._continuation.token) return [];

        const nextPage = await request(`${BASE_API}${this._continuation.api}&prettyPrint=false`, {
            method: 'POST',
            body: JSON.stringify({
                continuation: this._continuation.token,
                context: {
                    client: {
                        utcOffsetMinutes: 0,
                        gl: 'US',
                        hl: 'en',
                        clientName: 'WEB',
                        clientVersion: this._continuation.clientVersion
                    },
                    user: {},
                    request: {}
                }
            })
        });

        const contents =
            JSON.parse(nextPage)?.onResponseReceivedActions[0]?.appendContinuationItemsAction?.continuationItems;
        if (!contents) return [];

        const playlist_videos = getPlaylistVideos(contents, limit);
        this.fetched_videos.set(`${this.__count}`, playlist_videos);
        this._continuation.token = getContinuationToken(contents);
        return playlist_videos;
    }
    /**
     * Fetches remaining data from playlist
     *
     * For fetching and getting all songs data, see `total_pages` property.
     * @param max Max no of videos to fetch
     *
     * Default = Infinity
     * @returns
     */
    async fetch(max = Infinity): Promise<YouTubePlayList> {
        const continuation = this._continuation.token;
        if (!continuation) return this;
        if (max < 1) max = Infinity;

        while (typeof this._continuation.token === 'string' && this._continuation.token.length) {
            this.__count++;
            const res = await this.next();
            max -= res.length;
            if (max <= 0) break;
            if (!res.length) break;
        }

        return this;
    }
    /**
     * YouTube Playlists are divided into pages.
     *
     * For example, if you want to get 101 - 200 songs
     *
     * ```ts
     * const playlist = await play.playlist_info('playlist url')
     *
     * await playlist.fetch()
     *
     * const result = playlist.page(2)
     * ```
     * @param number Page number
     * @returns Array of YouTube Video Class
     * @see {@link YouTubePlayList.all_videos}
     */
    page(number: number): YouTubeVideo[] {
        if (!number) throw new Error('Page number is not provided');
        if (!this.fetched_videos.has(`${number}`)) throw new Error('Given Page number is invalid');
        return this.fetched_videos.get(`${number}`) as YouTubeVideo[];
    }
    /**
     * Gets total number of pages in that playlist class.
     * @see {@link YouTubePlayList.all_videos}
     */
    get total_pages() {
        return this.fetched_videos.size;
    }
    /**
     * This tells total number of videos that have been fetched so far.
     *
     * This can be equal to videosCount if all videos in playlist have been fetched and they are not hidden.
     */
    get total_videos() {
        const page_number: number = this.total_pages;
        return (page_number - 1) * 100 + (this.fetched_videos.get(`${page_number}`) as YouTubeVideo[]).length;
    }
    /**
     * Fetches all the videos in the playlist and returns them
     *
     * ```ts
     * const playlist = await play.playlist_info('playlist url')
     *
     * const videos = await playlist.all_videos()
     * ```
     * @returns An array of {@link YouTubeVideo} objects
     * @see {@link YouTubePlayList.fetch}
     */
    async all_videos(): Promise<YouTubeVideo[]> {
        await this.fetch();

        const videos = [];

        for (const page of this.fetched_videos.values()) videos.push(...page);

        return videos;
    }
    /**
     * Converts Playlist Class to a json parsed data.
     * @returns
     */
    toJSON(): PlaylistJSON {
        return {
            id: this.id,
            title: this.title,
            thumbnail: this.thumbnail?.toJSON() || this.thumbnail,
            channel: this.channel,
            url: this.url,
            videos: this.videos
        };
    }
}

interface PlaylistJSON {
    /**
     * YouTube Playlist ID
     */
    id?: string;
    /**
     * YouTube Playlist Name
     */
    title?: string;
    /**
     * Total no of videos in that playlist
     */
    videoCount?: number;
    /**
     * Time when playlist was last updated
     */
    lastUpdate?: string;
    /**
     * Total views of that playlist
     */
    views?: number;
    /**
     * YouTube Playlist url
     */
    url?: string;
    /**
     * YouTube Playlist url with starting video url.
     */
    link?: string;
    /**
     * YouTube Playlist channel data
     */
    channel?: YouTubeChannel;
    /**
     * YouTube Playlist thumbnail Data
     */
    thumbnail?: {
        width: number | undefined;
        height: number | undefined;
        url: string | undefined;
    };
    /**
     * first 100 videos in that playlist
     */
    videos?: YouTubeVideo[];
}
