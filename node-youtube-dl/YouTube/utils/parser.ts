import { Video } from "../classes/Video";
import { PlayList } from "../classes/Playlist";
import { Channel } from "../classes/Channel";
import { RequestInit } from "node-fetch";

export interface ParseSearchInterface {
    type?: "video" | "playlist" | "channel" | "all";
    limit?: number;
    requestOptions?: RequestInit;
}

export function ParseSearchResult(html :string, options? : ParseSearchInterface): (Video | PlayList | Channel)[] {
    if(!html) throw new Error('Can\'t parse Search result without data')
    if (!options) options = { type: "video", limit: 0 };
    if (!options.type) options.type = "video";

    let results = []
    let details = []
    let fetched = false;

    try {
        let data = html.split("ytInitialData = JSON.parse('")[1].split("');</script>")[0];
        html = data.replace(/\\x([0-9A-F]{2})/gi, (...items) => {
            return String.fromCharCode(parseInt(items[1], 16));
        });
    } catch {
        /* do nothing */
    }

    try {
        details = JSON.parse(html.split('{"itemSectionRenderer":{"contents":')[html.split('{"itemSectionRenderer":{"contents":').length - 1].split(',"continuations":[{')[0]);
        fetched = true;
    } catch {
        /* do nothing */
    }

    if (!fetched) {
        try {
            details = JSON.parse(html.split('{"itemSectionRenderer":')[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]).contents;
            fetched = true;
        } catch {
            /* do nothing */
        }
    }

    if (!fetched) throw new Error('Failed to Fetch the data')

    for (let i = 0; i < details.length; i++) {
        if (typeof options.limit === "number" && options.limit > 0 && results.length >= options.limit) break;
        let data = details[i];
        let res;
        if (options.type === "all") {
            if (!!data.videoRenderer) options.type = "video";
            else if (!!data.channelRenderer) options.type = "channel";
            else if (!!data.playlistRenderer) options.type = "playlist";
            else continue;
        }

        if (options.type === "video") {
            const parsed = parseVideo(data);
            if (!parsed) continue;
            res = parsed;
        } else if (options.type === "channel") {
            const parsed = parseChannel(data);
            if (!parsed) continue;
            res = parsed;
        } else if (options.type === "playlist") {
            const parsed = parsePlaylist(data);
            if (!parsed) continue;
            res = parsed;
        }

        results.push(res);
    }

return results as (Video | Channel | PlayList)[];
}

export function getPlaylistVideos(data:any, limit : number = Infinity) : Video[] {
    const videos = [];

    for (let i = 0; i < data.length; i++) {
        if (limit === videos.length) break;
        const info = data[i].playlistVideoRenderer;
        if (!info || !info.shortBylineText) continue;

        videos.push(
            new Video({
                id: info.videoId,
                index: parseInt(info.index?.simpleText) || 0,
                duration: parseDuration(info.lengthText?.simpleText) || 0,
                duration_raw: info.lengthText?.simpleText ?? "0:00",
                thumbnail: {
                    id: info.videoId,
                    url: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].url,
                    height: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].height,
                    width: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].width
                },
                title: info.title.runs[0].text,
                channel: {
                    id: info.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId || undefined,
                    name: info.shortBylineText.runs[0].text || undefined,
                    url: `https://www.youtube.com${info.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl || info.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
                    icon: undefined
                }
            })
        );
    }
    return videos   
}

export function parseDuration(duration: string): number {
    duration ??= "0:00";
    const args = duration.split(":");
    let dur = 0;

    switch (args.length) {
        case 3:
            dur = parseInt(args[0]) * 60 * 60 + parseInt(args[1]) * 60 + parseInt(args[2]);
            break;
        case 2:
            dur = parseInt(args[0]) * 60 + parseInt(args[1]);
            break;
        default:
            dur = parseInt(args[0]);
    }

    return dur;
}

export function getContinuationToken(data:any): string {
    const continuationToken = data.find((x: any) => Object.keys(x)[0] === "continuationItemRenderer")?.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
    return continuationToken;
}

export function parseChannel(data?: any): Channel | void {
    if (!data || !data.channelRenderer) return;
    const badge = data.channelRenderer.ownerBadges && data.channelRenderer.ownerBadges[0];
    let url = `https://www.youtube.com${data.channelRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl || data.channelRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`;
    let res = new Channel({
        id: data.channelRenderer.channelId,
        name: data.channelRenderer.title.simpleText,
        icon: data.channelRenderer.thumbnail.thumbnails[data.channelRenderer.thumbnail.thumbnails.length - 1],
        url: url,
        verified: Boolean(badge?.metadataBadgeRenderer?.style?.toLowerCase().includes("verified")),
        subscribers: data.channelRenderer.subscriberCountText.simpleText
    });

    return res;
}

export function parseVideo(data?: any): Video | void {
    if (!data || !data.videoRenderer) return;

    const badge = data.videoRenderer.ownerBadges && data.videoRenderer.ownerBadges[0];
    let res = new Video({
        id: data.videoRenderer.videoId,
        url: `https://www.youtube.com/watch?v=${data.videoRenderer.videoId}`,
        title: data.videoRenderer.title.runs[0].text,
        description: data.videoRenderer.descriptionSnippet && data.videoRenderer.descriptionSnippet.runs[0] ? data.videoRenderer.descriptionSnippet.runs[0].text : "",
        duration: data.videoRenderer.lengthText ? parseDuration(data.videoRenderer.lengthText.simpleText) : 0,
        duration_raw: data.videoRenderer.lengthText ? data.videoRenderer.lengthText.simpleText : null,
        thumbnail: {
            id: data.videoRenderer.videoId,
            url: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].url,
            height: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].height,
            width: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].width
        },
        channel: {
            id: data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId || null,
            name: data.videoRenderer.ownerText.runs[0].text || null,
            url: `https://www.youtube.com${data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl || data.videoRenderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
            icon: {
                url: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url,
                width: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].width,
                height: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].height
            },
            verified: Boolean(badge?.metadataBadgeRenderer?.style?.toLowerCase().includes("verified"))
        },
        uploadedAt: data.videoRenderer.publishedTimeText?.simpleText ?? null,
        views: data.videoRenderer.viewCountText?.simpleText?.replace(/[^0-9]/g, "") ?? 0
    });

    return res;
}

export function parsePlaylist(data?: any): PlayList | void {
    if (!data.playlistRenderer) return;

    const res = new PlayList(
        {
            id: data.playlistRenderer.playlistId,
            title: data.playlistRenderer.title.simpleText,
            thumbnail: {
                id: data.playlistRenderer.playlistId,
                url: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].url,
                height: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].height,
                width: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].width
            },
            channel: {
                id: data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                name: data.playlistRenderer.shortBylineText.runs[0].text,
                url: `https://www.youtube.com${data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`
            },
            videos: parseInt(data.playlistRenderer.videoCount.replace(/[^0-9]/g, ""))
        },
        true
    );

    return res;
}