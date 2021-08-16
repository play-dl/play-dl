import { getPlaylistVideos, getContinuationToken } from "../utils/extractor";
import { url_get } from "../utils/request";
import { Thumbnail } from "./Thumbnail";
import { Channel } from "./Channel";
import { Video } from "./Video";
const BASE_API = "https://www.youtube.com/youtubei/v1/browse?key=";

export class PlayList{
    id?: string;
    title?: string;
    videoCount?: number;
    lastUpdate?: string;
    views?: number;
    url?: string;
    link?: string;
    channel?: Channel;
    thumbnail?: Thumbnail;
    private videos?: [];
    private fetched_videos : Map<string, Video[]>
    private _continuation: { api?: string; token?: string; clientVersion?: string } = {};
    private __count : number

    constructor(data : any, searchResult : Boolean = false){
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);
        this.__count = 0
        this.fetched_videos = new Map()
        if(searchResult) this.__patchSearch(data)
        else this.__patch(data)
    }

    private __patch(data:any){
        this.id = data.id || undefined;
        this.url = data.url || undefined;
        this.title = data.title || undefined;
        this.videoCount = data.videoCount || 0;
        this.lastUpdate = data.lastUpdate || undefined;
        this.views = data.views || 0;
        this.link = data.link || undefined;
        this.channel = data.author || undefined;
        this.thumbnail = data.thumbnail || undefined;
        this.videos = data.videos || [];
        this.__count ++
        this.fetched_videos.set(`page${this.__count}`, this.videos as Video[])
        this._continuation.api = data.continuation?.api ?? undefined;
        this._continuation.token = data.continuation?.token ?? undefined;
        this._continuation.clientVersion = data.continuation?.clientVersion ?? "<important data>";
    }

    private __patchSearch(data: any){
        this.id = data.id || undefined;
        this.url = this.id ? `https://www.youtube.com/playlist?list=${this.id}` : undefined;
        this.title = data.title || undefined;
        this.thumbnail = data.thumbnail || undefined;
        this.channel = data.channel || undefined;
        this.videos = [];
        this.videoCount = data.videos || 0;
        this.link = undefined;
        this.lastUpdate = undefined;
        this.views = 0;
    }

    async next(limit: number = Infinity): Promise<Video[]> {
        if (!this._continuation || !this._continuation.token) return [];

        let nextPage = await url_get(`${BASE_API}${this._continuation.api}`, {
            method: "POST",
            body: JSON.stringify({
                continuation: this._continuation.token,
                context: {
                    client: {
                        utcOffsetMinutes: 0,
                        gl: "US",
                        hl: "en",
                        clientName: "WEB",
                        clientVersion: this._continuation.clientVersion
                    },
                    user: {},
                    request: {}
                }
            })
        });
        
        let contents = JSON.parse(nextPage)?.onResponseReceivedActions[0]?.appendContinuationItemsAction?.continuationItems
        if(!contents) return []

        let playlist_videos = getPlaylistVideos(contents, limit)
        this.fetched_videos.set(`page${this.__count}`, playlist_videos)
        this._continuation.token = getContinuationToken(contents)
        return playlist_videos
    }

    async fetch(max: number = Infinity) {
        let continuation = this._continuation.token;
        if (!continuation) return this;
        if (max < 1) max = Infinity;

        while (typeof this._continuation.token === "string" && this._continuation.token.length) {
            if (this.videos?.length as number >= max) break;
            this.__count++
            const res = await this.next();
            if (!res.length) break;
        }

        return this;
    }

    get type(): "playlist" {
        return "playlist";
    }

    page(number : number): Video[]{
        if(!number) throw new Error('Given Page number is not provided')
        if(!this.fetched_videos.has(`page${number}`)) throw new Error('Given Page number is invalid')
        return this.fetched_videos.get(`page${number}`) as Video[]
    }

    get total_pages(){
        return this.fetched_videos.size
    }

    get total_videos(){
        let page_number: number = this.total_pages
        return (page_number - 1) * 100 + (this.fetched_videos.get(`page${page_number}`) as Video[]).length
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            thumbnail: this.thumbnail,
            channel: {
                name : this.channel?.name,
                id : this.channel?.id,
                icon : this.channel?.iconURL()
            },
            url: this.url,
            videos: this.videos
        };
    }
}