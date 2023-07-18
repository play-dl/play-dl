import { YouTubeVideo } from '../classes/Video';
import { YouTubePlayList } from '../classes/Playlist';
import { YouTubeChannel } from '../classes/Channel';
import { YouTube } from '..';
export interface ParseSearchInterface {
    type?: 'video' | 'playlist' | 'channel';
    limit?: number;
    language?: string;
    unblurNSFWThumbnails?: boolean;
}
export interface thumbnail {
    width: string;
    height: string;
    url: string;
}
/**
 * Main command which converts html body data and returns the type of data requested.
 * @param html body of that request
 * @param options limit & type of YouTube search you want.
 * @returns Array of one of YouTube type.
 */
export declare function ParseSearchResult(html: string, options?: ParseSearchInterface): YouTube[];
/**
 * Function to parse Channel searches
 * @param data body of that channel request.
 * @returns YouTubeChannel class
 */
export declare function parseChannel(data?: any): YouTubeChannel;
/**
 * Function to parse Video searches
 * @param data body of that video request.
 * @returns YouTubeVideo class
 */
export declare function parseVideo(data?: any): YouTubeVideo;
/**
 * Function to parse Playlist searches
 * @param data body of that playlist request.
 * @returns YouTubePlaylist class
 */
export declare function parsePlaylist(data?: any): YouTubePlayList;
//# sourceMappingURL=parser.d.ts.map