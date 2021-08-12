import { url_get } from "./utils/request";
import fs from 'fs'
import { ParseSearchInterface, ParseSearchResult } from "./utils/parser";
import { Video } from "./classes/Video";
import { Channel } from "./classes/Channel";
import { PlayList } from "./classes/Playlist";


export async function search(url:string, options? : ParseSearchInterface): Promise<(Video | Channel | PlayList)[]> {
    let body = await url_get(url)
    let data = ParseSearchResult(body)
    return data
}