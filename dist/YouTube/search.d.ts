import { ParseSearchInterface } from './utils/parser';
import { YouTubeVideo } from './classes/Video';
import { YouTubeChannel } from './classes/Channel';
import { YouTubePlayList } from './classes/Playlist';
/**
 * Type for YouTube returns
 */
export type YouTube = YouTubeVideo | YouTubeChannel | YouTubePlayList;
/**
 * Command to search from YouTube
 * @param search The query to search
 * @param options limit & type of YouTube search you want.
 * @returns YouTube type.
 */
export declare function yt_search(search: string, options?: ParseSearchInterface): Promise<YouTube[]>;
//# sourceMappingURL=search.d.ts.map