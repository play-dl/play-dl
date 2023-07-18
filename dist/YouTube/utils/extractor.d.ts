import { YouTubeVideo } from '../classes/Video';
import { YouTubePlayList } from '../classes/Playlist';
import { InfoData, StreamInfoData } from './constants';
interface InfoOptions {
    htmldata?: boolean;
    language?: string;
}
interface PlaylistOptions {
    incomplete?: boolean;
    language?: string;
}
/**
 * Validate YouTube URL or ID.
 *
 * **CAUTION :** If your search word is 11 or 12 characters long, you might get it validated as video ID.
 *
 * To avoid above, add one more condition to yt_validate
 * ```ts
 * if (url.startsWith('https') && yt_validate(url) === 'video') {
 *      // YouTube Video Url.
 * }
 * ```
 * @param url YouTube URL OR ID
 * @returns
 * ```
 * 'playlist' | 'video' | 'search' | false
 * ```
 */
export declare function yt_validate(url: string): 'playlist' | 'video' | 'search' | false;
/**
 * Extract ID of YouTube url.
 * @param url ID or url of YouTube
 * @returns ID of video or playlist.
 */
export declare function extractID(url: string): string;
/**
 * Basic function to get data from a YouTube url or ID.
 *
 * Example
 * ```ts
 * const video = await play.video_basic_info('youtube video url')
 *
 * const res = ... // Any https package get function.
 *
 * const video = await play.video_basic_info(res.body, { htmldata : true })
 * ```
 * @param url YouTube url or ID or html body data
 * @param options Video Info Options
 *  - `boolean` htmldata : given data is html data or not
 * @returns Video Basic Info {@link InfoData}.
 */
export declare function video_basic_info(url: string, options?: InfoOptions): Promise<InfoData>;
/**
 * Gets the data required for streaming from YouTube url, ID or html body data and deciphers it.
 *
 * Internal function used by {@link stream} instead of {@link video_info}
 * because it only extracts the information required for streaming.
 *
 * @param url YouTube url or ID or html body data
 * @param options Video Info Options
 *  - `boolean` htmldata : given data is html data or not
 * @returns Deciphered Video Info {@link StreamInfoData}.
 */
export declare function video_stream_info(url: string, options?: InfoOptions): Promise<StreamInfoData>;
/**
 * Gets data from YouTube url or ID or html body data and deciphers it.
 * ```
 * video_basic_info + decipher_info = video_info
 * ```
 *
 * Example
 * ```ts
 * const video = await play.video_info('youtube video url')
 *
 * const res = ... // Any https package get function.
 *
 * const video = await play.video_info(res.body, { htmldata : true })
 * ```
 * @param url YouTube url or ID or html body data
 * @param options Video Info Options
 *  - `boolean` htmldata : given data is html data or not
 * @returns Deciphered Video Info {@link InfoData}.
 */
export declare function video_info(url: string, options?: InfoOptions): Promise<InfoData>;
/**
 * Function uses data from video_basic_info and deciphers it if it contains signatures.
 * @param data Data - {@link InfoData}
 * @param audio_only `boolean` - To decipher only audio formats only.
 * @returns Deciphered Video Info {@link InfoData}
 */
export declare function decipher_info<T extends InfoData | StreamInfoData>(data: T, audio_only?: boolean): Promise<T>;
/**
 * Gets YouTube playlist info from a playlist url.
 *
 * Example
 * ```ts
 * const playlist = await play.playlist_info('youtube playlist url')
 *
 * const playlist = await play.playlist_info('youtube playlist url', { incomplete : true })
 * ```
 * @param url Playlist URL
 * @param options Playlist Info Options
 * - `boolean` incomplete : When this is set to `false` (default) this function will throw an error
 *                          if the playlist contains hidden videos.
 *                          If it is set to `true`, it parses the playlist skipping the hidden videos,
 *                          only visible videos are included in the resulting {@link YouTubePlaylist}.
 *
 * @returns YouTube Playlist
 */
export declare function playlist_info(url: string, options?: PlaylistOptions): Promise<YouTubePlayList>;
/**
 * Function to parse Playlist from YouTube search
 * @param data html data of that request
 * @param limit No. of videos to parse
 * @returns Array of YouTubeVideo.
 */
export declare function getPlaylistVideos(data: any, limit?: number): YouTubeVideo[];
/**
 * Function to get Continuation Token
 * @param data html data of playlist url
 * @returns token
 */
export declare function getContinuationToken(data: any): string;
export {};
//# sourceMappingURL=extractor.d.ts.map