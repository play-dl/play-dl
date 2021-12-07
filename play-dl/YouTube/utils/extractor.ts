import { request } from './../../Request/index';
import { format_decipher } from './cipher';
import { YouTubeVideo } from '../classes/Video';
import { YouTubePlayList } from '../classes/Playlist';
import { InfoData, StreamInfoData } from './constants';

interface InfoOptions {
    htmldata?: boolean;
}

interface PlaylistOptions {
    incomplete?: boolean;
}

const video_id_pattern = /^[a-zA-Z\d_-]{11,12}$/;
const playlist_id_pattern = /^(PL|UU|LL|RD|OL)[a-zA-Z\d_-]{16,41}$/;
const DEFAULT_API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
const video_pattern =
    /^((?:https?:)?\/\/)?(?:(?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|shorts\/|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
const playlist_pattern =
    /^((?:https?:)?\/\/)?(?:(?:www|m)\.)?(youtube\.com)\/(?:(playlist|watch))(.*)?((\?|\&)list=)(PL|UU|LL|RD|OL)[a-zA-Z\d_-]{16,41}(.*)?$/;
/**
 * Validate YouTube URL or ID.
 *
 * **CAUTION :** If your search word is 11-12 long, you might get it validated as video ID.
 *
 * To avoid above, add one more condition to yt_validate
 * ```ts
 * if (url.startsWith('https') && yt_validate(url) === 'video') {
 *      // YouTube Video Url.
 * }
 * ```
 * @param url YouTube URL OR ID
 * @returns
 * ```
 * 'playlist' | 'video' | 'search' | false
 * ```
 */
export function yt_validate(url: string): 'playlist' | 'video' | 'search' | false {
    if (url.indexOf('list=') === -1) {
        if (url.startsWith('https')) {
            if (url.match(video_pattern)) {
                let id: string;
                if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split(/(\?|\/|&)/)[0];
                else if (url.includes('youtube.com/embed/'))
                    id = url.split('youtube.com/embed/')[1].split(/(\?|\/|&)/)[0];
                else if (url.includes('youtube.com/shorts/'))
                    id = url.split('youtube.com/shorts/')[1].split(/(\?|\/|&)/)[0];
                else id = url.split('watch?v=')[1].split(/(\?|\/|&)/)[0];
                if (id.match(video_id_pattern)) return 'video';
                else return false;
            } else return false;
        } else {
            if (url.match(video_id_pattern)) return 'video';
            else if (url.match(playlist_id_pattern)) return 'playlist';
            else return 'search';
        }
    } else {
        if (!url.match(playlist_pattern)) return false;
        else return 'playlist';
    }
}
/**
 * Extract ID of YouTube url.
 * @param url ID or url of YouTube
 * @returns ID of video or playlist.
 */
export function extractID(url: string): string {
    const check = yt_validate(url);
    if (!check || check === 'search') throw new Error('This is not a YouTube url or videoId or PlaylistID');
    if (url.startsWith('https')) {
        if (url.indexOf('list=') === -1) {
            let video_id: string;
            if (url.includes('youtu.be/')) video_id = url.split('youtu.be/')[1].split(/(\?|\/|&)/)[0];
            else if (url.includes('youtube.com/embed/'))
                video_id = url.split('youtube.com/embed/')[1].split(/(\?|\/|&)/)[0];
            else if (url.includes('youtube.com/shorts/'))
                video_id = url.split('youtube.com/shorts/')[1].split(/(\?|\/|&)/)[0];
            else video_id = url.split('watch?v=')[1].split(/(\?|\/|&)/)[0];
            return video_id;
        } else {
            return url.split('list=')[1].split('&')[0];
        }
    } else return url;
}
/**
 * Basic function to get data from a YouTube url or ID.
 * 
 * Example
 * ```ts
 * const video = await play.video_basic_info('youtube video url')
 * 
 * const res = ... // Any https package get function.
 * 
 * const video = await play.video_basic_info(res.body, { htmldata : true })
 * ```
 * @param url YouTube url or ID or html body data
 * @param options Video Info Options
 *  - `boolean` htmldata : given data is html data or not
 * @returns Video Basic Info {@link InfoData}.
 */
export async function video_basic_info(url: string, options: InfoOptions = {}): Promise<InfoData> {
    let body: string;
    if (options.htmldata) {
        body = url;
    } else {
        if (yt_validate(url) !== 'video') throw new Error('This is not a YouTube Watch URL');
        const video_id: string = extractID(url);
        const new_url = `https://www.youtube.com/watch?v=${video_id}&has_verified=1`;
        body = await request(new_url, {
            headers: {
                'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7'
            },
            cookies: true
        });
    }
    if (body.indexOf('Our systems have detected unusual traffic from your computer network.') !== -1)
        throw new Error('Captcha page: YouTube has detected that you are a bot!');
    const player_data = body
        .split('var ytInitialPlayerResponse = ')?.[1]
        ?.split(';</script>')[0]
        .split(/;\s*(var|const|let)/)[0];
    if (!player_data) throw new Error('Initial Player Response Data is undefined.');
    const initial_data = body
        .split('var ytInitialData = ')?.[1]
        ?.split(';</script>')[0]
        .split(/;\s*(var|const|let)/)[0];
    if (!initial_data) throw new Error('Initial Response Data is undefined.');
    const player_response = JSON.parse(player_data);
    const initial_response = JSON.parse(initial_data);
    if (player_response.playabilityStatus.status !== 'OK')
        throw new Error(
            `While getting info from url\n${
                player_response.playabilityStatus.errorScreen.playerErrorMessageRenderer?.reason.simpleText ??
                player_response.playabilityStatus.errorScreen.playerKavRenderer?.reason.simpleText
            }`
        );
    const ownerInfo =
        initial_response.contents.twoColumnWatchNextResults.results?.results?.contents[1]?.videoSecondaryInfoRenderer
            ?.owner?.videoOwnerRenderer;
    const badge = ownerInfo?.badges && ownerInfo?.badges[0];
    const html5player = `https://www.youtube.com${body.split('"jsUrl":"')[1].split('"')[0]}`;
    const related: string[] = [];
    initial_response.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results.forEach(
        (res: any) => {
            if (res.compactVideoRenderer)
                related.push(`https://www.youtube.com/watch?v=${res.compactVideoRenderer.videoId}`);
        }
    );
    const format = [];
    const vid = player_response.videoDetails;
    const microformat = player_response.microformat.playerMicroformatRenderer;
    const ratingButtons =
        initial_response.contents.twoColumnWatchNextResults.results.results.contents.find(
            (content: any) => content.videoPrimaryInfoRenderer
        )?.videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons ?? [];
    const video_details = new YouTubeVideo({
        id: vid.videoId,
        url: `https://www.youtube.com/watch?v=${vid.videoId}`,
        title: vid.title,
        description: vid.shortDescription,
        duration: Number(vid.lengthSeconds),
        duration_raw: parseSeconds(Number(vid.lengthSeconds)),
        uploadedAt: microformat.publishDate,
        thumbnail: vid.thumbnail.thumbnails[vid.thumbnail.thumbnails.length - 1],
        channel: {
            name: vid.author,
            id: vid.channelId,
            url: `https://www.youtube.com/channel/${vid.channelId}`,
            verified: Boolean(badge?.metadataBadgeRenderer?.style?.toLowerCase().includes('verified')),
            artist: Boolean(badge?.metadataBadgeRenderer?.style?.toLowerCase().includes('artist')),
            icons: ownerInfo?.thumbnail?.thumbnails || undefined
        },
        views: vid.viewCount,
        tags: vid.keywords,
        averageRating: vid.averageRating,
        likes: parseInt(
            ratingButtons
                .find((button: any) => button.toggleButtonRenderer.defaultIcon.iconType === 'LIKE')
                ?.toggleButtonRenderer.defaultText.accessibility?.accessibilityData.label.replace(/\D+/g, '') ?? 0
        ),
        dislikes: parseInt(
            ratingButtons
                .find((button: any) => button.toggleButtonRenderer.defaultIcon.iconType === 'DISLIKE')
                ?.toggleButtonRenderer.defaultText.accessibility?.accessibilityData.label.replace(/\D+/g, '') ?? 0
        ),
        live: vid.isLiveContent,
        private: vid.isPrivate
    });
    format.push(...(player_response.streamingData.formats ?? []));
    format.push(...(player_response.streamingData.adaptiveFormats ?? []));
    const LiveStreamData = {
        isLive: video_details.live,
        dashManifestUrl: player_response.streamingData?.dashManifestUrl ?? null,
        hlsManifestUrl: player_response.streamingData?.hlsManifestUrl ?? null
    };
    return {
        LiveStreamData,
        html5player,
        format,
        video_details,
        related_videos: related
    };
}
/**
 * Gets the data required for streaming from YouTube url, ID or html body data and deciphers it.
 *
 * Internal function used by {@link stream} instead of {@link video_info}
 * because it only extracts the information required for streaming.
 *
 * @param url YouTube url or ID or html body data
 * @param options Video Info Options
 *  - `Proxy[]` proxy : sends data through a proxy
 *  - `boolean` htmldata : given data is html data or not
 * @returns Deciphered Video Info {@link StreamInfoData}.
 */
export async function video_stream_info(url: string, options: InfoOptions = {}): Promise<StreamInfoData> {
    let body: string;
    if (options.htmldata) {
        body = url;
    } else {
        if (yt_validate(url) !== 'video') throw new Error('This is not a YouTube Watch URL');
        const video_id: string = extractID(url);
        const new_url = `https://www.youtube.com/watch?v=${video_id}&has_verified=1`;
        body = await request(new_url, {
            proxies: options.proxy ?? [],
            headers: { 'accept-language': 'en-US,en;q=0.9' },
            cookies: true
        });
    }
    if (body.indexOf('Our systems have detected unusual traffic from your computer network.') !== -1)
        throw new Error('Captcha page: YouTube has detected that you are a bot!');
    const player_data = body
        .split('var ytInitialPlayerResponse = ')?.[1]
        ?.split(';</script>')[0]
        .split(/;\s*(var|const|let)/)[0];
    if (!player_data) throw new Error('Initial Player Response Data is undefined.');
    const player_response = JSON.parse(player_data);
    if (player_response.playabilityStatus.status !== 'OK')
        throw new Error(
            `While getting info from url\n${
                player_response.playabilityStatus.errorScreen.playerErrorMessageRenderer?.reason.simpleText ??
                player_response.playabilityStatus.errorScreen.playerKavRenderer?.reason.simpleText
            }`
        );
    const html5player = `https://www.youtube.com${body.split('"jsUrl":"')[1].split('"')[0]}`;
    const duration = Number(player_response.videoDetails.lengthSeconds);
    const video_details = {
        url: `https://www.youtube.com/watch?v=${player_response.videoDetails.videoId}`,
        durationInSec: (duration < 0 ? 0 : duration) || 0
    };
    const format = [];
    format.push(...(player_response.streamingData.formats ?? []));
    format.push(...(player_response.streamingData.adaptiveFormats ?? []));

    const LiveStreamData = {
        isLive: player_response.videoDetails.isLiveContent,
        dashManifestUrl: player_response.streamingData?.dashManifestUrl ?? null,
        hlsManifestUrl: player_response.streamingData?.hlsManifestUrl ?? null
    };
    return await decipher_info({
        LiveStreamData,
        html5player,
        format,
        video_details
    });
}
/**
 * Function to convert seconds to [hour : minutes : seconds] format
 * @param seconds seconds to convert
 * @returns [hour : minutes : seconds] format
 */
function parseSeconds(seconds: number): string {
    const d = Number(seconds);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);

    const hDisplay = h > 0 ? (h < 10 ? `0${h}` : h) + ':' : '';
    const mDisplay = m > 0 ? (m < 10 ? `0${m}` : m) + ':' : '00:';
    const sDisplay = s > 0 ? (s < 10 ? `0${s}` : s) : '00';
    return hDisplay + mDisplay + sDisplay;
}
/**
 * Gets data from YouTube url or ID or html body data and deciphers it.
 * ```
 * video_basic_info + decipher_info = video_info
 * ```
 * 
 * Example
 * ```ts
 * const video = await play.video_info('youtube video url')
 * 
 * const res = ... // Any https package get function.
 * 
 * const video = await play.video_info(res.body, { htmldata : true })
 * ```
 * @param url YouTube url or ID or html body data
 * @param options Video Info Options
 *  - `boolean` htmldata : given data is html data or not
 * @returns Deciphered Video Info {@link InfoData}.
 */
export async function video_info(url: string, options: InfoOptions = {}): Promise<InfoData> {
    const data = await video_basic_info(url, options);
    return await decipher_info(data);
}
/**
 * Function uses data from video_basic_info and deciphers it if it contains signatures.
 * @param data Data - {@link InfoData}
 * @returns Deciphered Video Info {@link InfoData}
 */
export async function decipher_info<T extends InfoData | StreamInfoData>(data: T): Promise<T> {
    if (data.LiveStreamData.isLive === true && data.LiveStreamData.dashManifestUrl !== null) {
        return data;
    } else if (data.format[0].signatureCipher || data.format[0].cipher) {
        data.format = await format_decipher(data.format, data.html5player);
        return data;
    } else {
        return data;
    }
}
/**
 * Gets YouTube playlist info from a playlist url.
 * 
 * Example
 * ```ts
 * const playlist = await play.playlist_info('youtube playlist url')
 * 
 * const playlist = await play.playlist_info('youtube playlist url', { incomplete : true })
 * ```
 * @param url Playlist URL
 * @param options Playlist Info Options
 * - `boolean` incomplete : If set to true, parses playlist with hidden videos.
 * 
 * @returns YouTube Playlist
 */
export async function playlist_info(url: string, options: PlaylistOptions = {}): Promise<YouTubePlayList> {
    if (!url || typeof url !== 'string') throw new Error(`Expected playlist url, received ${typeof url}!`);
    let Playlist_id: string;
    if (url.startsWith('https')) {
        if (yt_validate(url) !== 'playlist') throw new Error('This is not a Playlist URL');
        Playlist_id = extractID(url);
    } else Playlist_id = url;
    const new_url = `https://www.youtube.com/playlist?list=${Playlist_id}`;

    const body = await request(new_url, {
        headers: {
            'accept-language': 'en-US,en-IN;q=0.9,en;q=0.8,hi;q=0.7'
        }
    });
    if (body.indexOf('Our systems have detected unusual traffic from your computer network.') !== -1)
        throw new Error('Captcha page: YouTube has detected that you are a bot!');
    const response = JSON.parse(body.split('var ytInitialData = ')[1].split(';</script>')[0]);
    if (response.alerts) {
        if (response.alerts[0].alertWithButtonRenderer?.type === 'INFO') {
            if (!options.incomplete)
                throw new Error(
                    `While parsing playlist url\n${response.alerts[0].alertWithButtonRenderer.text.simpleText}`
                );
        } else if (response.alerts[0].alertRenderer?.type === 'ERROR')
            throw new Error(`While parsing playlist url\n${response.alerts[0].alertRenderer.text.runs[0].text}`);
        else throw new Error('While parsing playlist url\nUnknown Playlist Error');
    }

    const rawJSON = `${body.split('{"playlistVideoListRenderer":{"contents":')[1].split('}],"playlistId"')[0]}}]`;
    const parsed = JSON.parse(rawJSON);
    const playlistDetails = JSON.parse(body.split('{"playlistSidebarRenderer":')[1].split('}};</script>')[0]).items;

    const API_KEY =
        body.split('INNERTUBE_API_KEY":"')[1]?.split('"')[0] ??
        body.split('innertubeApiKey":"')[1]?.split('"')[0] ??
        DEFAULT_API_KEY;
    const videos = getPlaylistVideos(parsed, 100);

    const data = playlistDetails[0].playlistSidebarPrimaryInfoRenderer;
    if (!data.title.runs || !data.title.runs.length) throw new Error('Failed to Parse Playlist info.');

    const author = playlistDetails[1]?.playlistSidebarSecondaryInfoRenderer.videoOwner;
    const views = data.stats.length === 3 ? data.stats[1].simpleText.replace(/[^0-9]/g, '') : 0;
    const lastUpdate =
        data.stats
            .find((x: any) => 'runs' in x && x['runs'].find((y: any) => y.text.toLowerCase().includes('last update')))
            ?.runs.pop()?.text ?? null;
    const videosCount = data.stats[0].runs[0].text.replace(/[^0-9]/g, '') || 0;

    const res = new YouTubePlayList({
        continuation: {
            api: API_KEY,
            token: getContinuationToken(parsed),
            clientVersion:
                body.split('"INNERTUBE_CONTEXT_CLIENT_VERSION":"')[1]?.split('"')[0] ??
                body.split('"innertube_context_client_version":"')[1]?.split('"')[0] ??
                '<some version>'
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
                  url: `https://www.youtube.com${
                      author.videoOwnerRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url ||
                      author.videoOwnerRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl
                  }`,
                  icon: author.videoOwnerRenderer.thumbnail.thumbnails.length
                      ? author.videoOwnerRenderer.thumbnail.thumbnails[
                            author.videoOwnerRenderer.thumbnail.thumbnails.length - 1
                        ].url
                      : null
              }
            : {},
        thumbnail: data.thumbnailRenderer.playlistVideoThumbnailRenderer?.thumbnail.thumbnails.length
            ? data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails[
                  data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails.length - 1
              ]
            : null
    });
    return res;
}
/**
 * Function to parse Playlist from YouTube search
 * @param data html data of that request
 * @param limit No. of videos to parse
 * @returns Array of YouTubeVideo.
 */
export function getPlaylistVideos(data: any, limit = Infinity): YouTubeVideo[] {
    const videos = [];

    for (let i = 0; i < data.length; i++) {
        if (limit === videos.length) break;
        const info = data[i].playlistVideoRenderer;
        if (!info || !info.shortBylineText) continue;

        videos.push(
            new YouTubeVideo({
                id: info.videoId,
                index: parseInt(info.index?.simpleText) || 0,
                duration: parseInt(info.lengthSeconds) || 0,
                duration_raw: info.lengthText?.simpleText ?? '0:00',
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
                    url: `https://www.youtube.com${
                        info.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
                        info.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url
                    }`,
                    icon: undefined
                }
            })
        );
    }
    return videos;
}
/**
 * Function to get Continuation Token
 * @param data html data of playlist url
 * @returns token
 */
export function getContinuationToken(data: any): string {
    return data.find((x: any) => Object.keys(x)[0] === 'continuationItemRenderer')?.continuationItemRenderer
        .continuationEndpoint?.continuationCommand?.token;
}
