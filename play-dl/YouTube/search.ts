import { request } from './utils/request';
import { ParseSearchInterface, ParseSearchResult } from './utils/parser';
import { YouTubeVideo } from './classes/Video';
import { YouTubeChannel } from './classes/Channel';
import { YouTubePlayList } from './classes/Playlist';

enum SearchType {
    Video = 'EgIQAQ%253D%253D',
    PlayList = 'EgIQAw%253D%253D',
    Channel = 'EgIQAg%253D%253D'
}

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
export async function yt_search(search: string, options: ParseSearchInterface = {}): Promise<YouTube[]> {
    let url = 'https://www.youtube.com/results?search_query=' + search.replaceAll(' ', '+');
    options.type ??= 'video';
    if (!url.match('&sp=')) {
        url += '&sp=';
        switch (options?.type) {
            case 'channel':
                url += SearchType.Channel;
                break;
            case 'playlist':
                url += SearchType.PlayList;
                break;
            case 'video':
                url += SearchType.Video;
                break;
        }
    }
    const body = await request(url, {
        headers: { 'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7' }
    });
    const data = ParseSearchResult(body, options);
    return data;
}
