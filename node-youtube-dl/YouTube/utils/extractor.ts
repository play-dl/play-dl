import { url_get } from './request'
import { format_decipher, js_tokens } from './cipher'
import { Video } from '../classes/Video'
import { RequestInit } from 'node-fetch'
import { PlayList } from '../classes/Playlist'

const DEFAULT_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const youtube_url = /https:\/\/www.youtube.com\//g
const video_pattern = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

export async function video_basic_info(url : string){
        if(!url.match(youtube_url) || !url.match(video_pattern)) throw new Error('This is not a YouTube URL')
        let video_id = url.split('watch?v=')[1].split('&')[0]
        let new_url = 'https://www.youtube.com/watch?v=' + video_id
        let body = await url_get(new_url)
        let player_response = JSON.parse(body.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0])
        if(player_response.playabilityStatus.status === 'ERROR') throw new Error(`While getting info from url \n  ${player_response.playabilityStatus.reason}`)
        let html5player =  'https://www.youtube.com' + body.split('"jsUrl":"')[1].split('"')[0]
        let format = []
        format.push(player_response.streamingData.formats[0])
        format.push(...player_response.streamingData.adaptiveFormats)
        let vid = player_response.videoDetails
        let microformat = player_response.microformat.playerMicroformatRenderer
        let video_details = {
            id : vid.videoId,
            url : 'https://www.youtube.com/watch?v=' + vid.videoId,
            title : vid.title,
            description : vid.shortDescription,
            duration : vid.lengthSeconds,
            uploadedDate : microformat.publishDate,
            thumbnail : {
                width : vid.thumbnail.thumbnails[vid.thumbnail.thumbnails.length - 1].width,
                height : vid.thumbnail.thumbnails[vid.thumbnail.thumbnails.length - 1].height,
                url : `https://i.ytimg.com/vi/${vid.videoId}/maxresdefault.jpg`
            },
            channel : {
                name : vid.author,
                id : vid.channelId,
                url : `https://www.youtube.com/channel/${vid.channelId}`
            },
            views : vid.viewCount,
            tags : vid.keywords,
            averageRating : vid.averageRating,
            live : vid.isLiveContent,
            private : vid.isPrivate
        }
        return {
            html5player,
            format,
            video_details
        }
}

export async function video_info(url : string) {
    let data = await video_basic_info(url)
    if(data.format[0].signatureCipher || data.format[0].cipher){
        data.format = await format_decipher(data.format, data.html5player)
        return data
    }
    else {
        return data
    }
}

export async function playlist_info(url : string) {
    if (!url || typeof url !== "string") throw new Error(`Expected playlist url, received ${typeof url}!`);
    if(url.search('(\\?|\\&)list\\=') === -1) throw new Error('This is not a PlayList URL')

    let Playlist_id = url.split('list=')[1].split('&')[0]
    let new_url = `https://www.youtube.com/playlist?list=${Playlist_id}`
    
    let body = await url_get(new_url)
    let response = JSON.parse(body.split("var ytInitialData = ")[1].split(";</script>")[0])
    if(response.alerts && response.alerts[0].alertRenderer.type === 'ERROR') throw new Error(`While parsing playlist url\n   ${response.alerts[0].alertRenderer.text.runs[0].text}`)

    let rawJSON = `${body.split('{"playlistVideoListRenderer":{"contents":')[1].split('}],"playlistId"')[0]}}]`;
    let parsed = JSON.parse(rawJSON);
    let playlistDetails = JSON.parse(body.split('{"playlistSidebarRenderer":')[1].split("}};</script>")[0]).items;

    let API_KEY = body.split('INNERTUBE_API_KEY":"')[1]?.split('"')[0] ?? body.split('innertubeApiKey":"')[1]?.split('"')[0] ?? DEFAULT_API_KEY;
    let videos = getPlaylistVideos(parsed, 100);

    let data = playlistDetails[0].playlistSidebarPrimaryInfoRenderer;
    if (!data.title.runs || !data.title.runs.length) return undefined;

    let author = playlistDetails[1]?.playlistSidebarSecondaryInfoRenderer.videoOwner;
    let views = data.stats.length === 3 ? data.stats[1].simpleText.replace(/[^0-9]/g, "") : 0;
    let lastUpdate = data.stats.find((x: any) => "runs" in x && x["runs"].find((y: any) => y.text.toLowerCase().includes("last update")))?.runs.pop()?.text ?? null;
    let videosCount = data.stats[0].runs[0].text.replace(/[^0-9]/g, "") || 0;

    let res = new PlayList({
        continuation: {
            api: API_KEY,
            token: getContinuationToken(parsed),
            clientVersion: body.split('"INNERTUBE_CONTEXT_CLIENT_VERSION":"')[1]?.split('"')[0] ?? body.split('"innertube_context_client_version":"')[1]?.split('"')[0] ?? "<some version>"
        },
        id: data.title.runs[0].navigationEndpoint.watchEndpoint.playlistId,
        title: data.title.runs[0].text,
        videoCount: parseInt(videosCount) || 0,
        lastUpdate: lastUpdate,
        views: parseInt(views) || 0,
        videos: videos,
        url: `https://www.youtube.com/playlist?list=${data.title.runs[0].navigationEndpoint.watchEndpoint.playlistId}`,
        link: `https://www.youtube.com${data.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
        author: author
            ? {
                  name: author.videoOwnerRenderer.title.runs[0].text,
                  id: author.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId,
                  url: `https://www.youtube.com${author.videoOwnerRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url || author.videoOwnerRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl}`,
                  icon: author.videoOwnerRenderer.thumbnail.thumbnails.length ? author.videoOwnerRenderer.thumbnail.thumbnails[author.videoOwnerRenderer.thumbnail.thumbnails.length - 1].url : null
              }
            : {},
        thumbnail: data.thumbnailRenderer.playlistVideoThumbnailRenderer?.thumbnail.thumbnails.length ? data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails[data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails.length - 1].url : null
    });
    return res;
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

function parseDuration(duration: string): number {
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