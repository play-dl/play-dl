import { request } from './../Request';
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
    let url = 'https://www.youtube.com/results?search_query=' + search;
    options.type ??= 'video';
    if (url.indexOf('&sp=') === -1) {
        url += '&sp=';
        switch (options.type) {
            case 'channel':
                url += SearchType.Channel;
                break;
            case 'playlist':
                url += SearchType.PlayList;
                break;
            case 'video':
                url += SearchType.Video;
                break;
            default:
                throw new Error(`Unknown search type: ${options.type}`);
        }
    }
    const body = await request(url, {
        headers: {
            'accept-language': options.language || 'en-US;q=0.9'
        }
    });
    if (body.indexOf('Our systems have detected unusual traffic from your computer network.') !== -1)
        throw new Error('Captcha page: YouTube has detected that you are a bot!');
    return ParseSearchResult(body, options);
}
