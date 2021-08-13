import { url_get } from "./utils/request";
import { ParseSearchInterface, ParseSearchResult } from "./utils/parser";
import { Video } from "./classes/Video";
import { Channel } from "./classes/Channel";
import { PlayList } from "./classes/Playlist";


enum SearchType {
    Video = 'EgIQAQ%253D%253D',
    PlayList = 'EgIQAw%253D%253D',
    Channel = 'EgIQAg%253D%253D',
}

export async function search(search :string, options? : ParseSearchInterface): Promise<(Video | Channel | PlayList)[]> {
    let url = 'https://www.youtube.com/results?search_query=' + search.replaceAll(' ', '+')
    if(!url.match('&sp=')){
        url += '&sp='
        switch(options?.type){
            case 'channel':
                url += SearchType.Channel
                break
            case 'playlist':
                url += SearchType.PlayList
                break
            case 'video':
                url += SearchType.Video
                break
        }
    }
    let body = await url_get(url)
    let data = ParseSearchResult(body, options)
    return data
}