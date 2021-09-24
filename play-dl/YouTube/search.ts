import { request } from './utils/request';
import { ParseSearchInterface, ParseSearchResult } from './utils/parser';
import { Video } from './classes/Video';
import { Channel } from './classes/Channel';
import { PlayList } from './classes/Playlist';

enum SearchType {
    Video = 'EgIQAQ%253D%253D',
    PlayList = 'EgIQAw%253D%253D',
    Channel = 'EgIQAg%253D%253D'
}

export async function yt_search(
    search: string,
    options: ParseSearchInterface = {}
): Promise<(Video | Channel | PlayList)[]> {
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
