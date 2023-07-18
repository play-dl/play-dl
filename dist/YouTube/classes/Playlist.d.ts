import { YouTubeChannel } from './Channel';
import { YouTubeVideo } from './Video';
import { YouTubeThumbnail } from './Thumbnail';
/**
 * YouTube Playlist Class containing vital informations about playlist.
 */
export declare class YouTubePlayList {
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
    private videos?;
    /**
     * Map contaning data of all fetched videos
     */
    private fetched_videos;
    /**
     * Token containing API key, Token, ClientVersion.
     */
    private _continuation;
    /**
     * Total no of pages count.
     */
    private __count;
    /**
     * Constructor for YouTube Playlist Class
     * @param data Json Parsed YouTube Playlist data
     * @param searchResult If the data is from search or not
     */
    constructor(data: any, searchResult?: boolean);
    /**
     * Updates variable according to a normal data.
     * @param data Json Parsed YouTube Playlist data
     */
    private __patch;
    /**
     * Updates variable according to a searched data.
     * @param data Json Parsed YouTube Playlist data
     */
    private __patchSearch;
    /**
     * Parses next segment of videos from playlist and returns parsed data.
     * @param limit Total no of videos to parse.
     *
     * Default = Infinity
     * @returns Array of YouTube Video Class
     */
    next(limit?: number): Promise<YouTubeVideo[]>;
    /**
     * Fetches remaining data from playlist
     *
     * For fetching and getting all songs data, see `total_pages` property.
     * @param max Max no of videos to fetch
     *
     * Default = Infinity
     * @returns
     */
    fetch(max?: number): Promise<YouTubePlayList>;
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
    page(number: number): YouTubeVideo[];
    /**
     * Gets total number of pages in that playlist class.
     * @see {@link YouTubePlayList.all_videos}
     */
    get total_pages(): number;
    /**
     * This tells total number of videos that have been fetched so far.
     *
     * This can be equal to videosCount if all videos in playlist have been fetched and they are not hidden.
     */
    get total_videos(): number;
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
    all_videos(): Promise<YouTubeVideo[]>;
    /**
     * Converts Playlist Class to a json parsed data.
     * @returns
     */
    toJSON(): PlaylistJSON;
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
export {};
//# sourceMappingURL=Playlist.d.ts.map