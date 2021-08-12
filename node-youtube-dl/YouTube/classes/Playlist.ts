import { getContinuationToken, getPlaylistVideos } from "../utils/parser";
import { url_get } from "../utils/request";
import { Thumbnail } from "./Thumbnail";
import { Channel } from "./Channel";
import { Video } from "./Video";
const BASE_API = "https://www.youtube.com/youtubei/v1/browse?key=";

export class PlayList{
    id?: string;
    title?: string;
    videoCount!: number;
    lastUpdate?: string;
    views?: number;
    url?: string;
    link?: string;
    channel?: Channel;
    thumbnail?: Thumbnail;
    videos!: [];
    private _continuation: { api?: string; token?: string; clientVersion?: string } = {};

    constructor(data : any, searchResult : Boolean = false){
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        if(searchResult) this.__patchSearch(data)
        else this.__patch(data)
    }

    private __patch(data:any){
        this.id = data.id || undefined;
        this.title = data.title || undefined;
        this.videoCount = data.videoCount || 0;
        this.lastUpdate = data.lastUpdate || undefined;
        this.views = data.views || 0;
        this.url = data.url || undefined;
        this.link = data.link || undefined;
        this.channel = data.author || undefined;
        this.thumbnail = data.thumbnail || undefined;
        this.videos = data.videos || [];
        this._continuation.api = data.continuation?.api ?? undefined;
        this._continuation.token = data.continuation?.token ?? undefined;
        this._continuation.clientVersion = data.continuation?.clientVersion ?? "<important data>";
    }

    private __patchSearch(data: any){
        this.id = data.id || undefined;
        this.title = data.title || undefined;
        this.thumbnail = data.thumbnail || undefined;
        this.channel = data.channel || undefined;
        this.videos = [];
        this.videoCount = data.videos || 0;
        this.url = this.id ? `https://www.youtube.com/playlist?list=${this.id}` : undefined;
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
        this._continuation.token = getContinuationToken(contents)

        return playlist_videos
    }

    async fetch(max: number = Infinity) {
        let continuation = this._continuation.token;
        if (!continuation) return this;
        if (max < 1) max = Infinity;

        while (typeof this._continuation.token === "string" && this._continuation.token.length) {
            if (this.videos.length >= max) break;
            const res = await this.next();
            if (!res.length) break;
        }

        return this;
    }

    get type(): "playlist" {
        return "playlist";
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