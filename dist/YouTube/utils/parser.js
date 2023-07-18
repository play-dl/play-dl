"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePlaylist = exports.parseVideo = exports.parseChannel = exports.ParseSearchResult = void 0;
const Video_1 = require("../classes/Video");
const Playlist_1 = require("../classes/Playlist");
const Channel_1 = require("../classes/Channel");
const BLURRED_THUMBNAILS = [
    '-oaymwEpCOADEI4CSFryq4qpAxsIARUAAAAAGAElAADIQj0AgKJDeAHtAZmZGUI=',
    '-oaymwEiCOADEI4CSFXyq4qpAxQIARUAAIhCGAFwAcABBu0BmZkZQg==',
    '-oaymwEiCOgCEMoBSFXyq4qpAxQIARUAAIhCGAFwAcABBu0BZmbmQQ==',
    '-oaymwEiCNAFEJQDSFXyq4qpAxQIARUAAIhCGAFwAcABBu0BZmZmQg==',
    '-oaymwEdCNAFEJQDSFryq4qpAw8IARUAAIhCGAHtAWZmZkI=',
    '-oaymwEdCNACELwBSFryq4qpAw8IARUAAIhCGAHtAT0K10E='
];
/**
 * Main command which converts html body data and returns the type of data requested.
 * @param html body of that request
 * @param options limit & type of YouTube search you want.
 * @returns Array of one of YouTube type.
 */
function ParseSearchResult(html, options) {
    if (!html)
        throw new Error("Can't parse Search result without data");
    if (!options)
        options = { type: 'video', limit: 0 };
    else if (!options.type)
        options.type = 'video';
    const hasLimit = typeof options.limit === 'number' && options.limit > 0;
    options.unblurNSFWThumbnails ??= false;
    const data = html
        .split('var ytInitialData = ')?.[1]
        ?.split(';</script>')[0]
        .split(/;\s*(var|const|let)\s/)[0];
    const json_data = JSON.parse(data);
    const results = [];
    const details = json_data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.flatMap((s) => s.itemSectionRenderer?.contents);
    for (const detail of details) {
        if (hasLimit && results.length === options.limit)
            break;
        if (!detail || (!detail.videoRenderer && !detail.channelRenderer && !detail.playlistRenderer))
            continue;
        switch (options.type) {
            case 'video': {
                const parsed = parseVideo(detail);
                if (parsed) {
                    if (options.unblurNSFWThumbnails)
                        parsed.thumbnails.forEach(unblurThumbnail);
                    results.push(parsed);
                }
                break;
            }
            case 'channel': {
                const parsed = parseChannel(detail);
                if (parsed)
                    results.push(parsed);
                break;
            }
            case 'playlist': {
                const parsed = parsePlaylist(detail);
                if (parsed) {
                    if (options.unblurNSFWThumbnails && parsed.thumbnail)
                        unblurThumbnail(parsed.thumbnail);
                    results.push(parsed);
                }
                break;
            }
            default:
                throw new Error(`Unknown search type: ${options.type}`);
        }
    }
    return results;
}
exports.ParseSearchResult = ParseSearchResult;
/**
 * Function to convert [hour : minutes : seconds] format to seconds
 * @param duration hour : minutes : seconds format
 * @returns seconds
 */
function parseDuration(duration) {
    if (!duration)
        return 0;
    const args = duration.split(':');
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
/**
 * Function to parse Channel searches
 * @param data body of that channel request.
 * @returns YouTubeChannel class
 */
function parseChannel(data) {
    if (!data || !data.channelRenderer)
        throw new Error('Failed to Parse YouTube Channel');
    const badge = data.channelRenderer.ownerBadges?.[0]?.metadataBadgeRenderer?.style?.toLowerCase();
    const url = `https://www.youtube.com${data.channelRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
        data.channelRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`;
    const thumbnail = data.channelRenderer.thumbnail.thumbnails[data.channelRenderer.thumbnail.thumbnails.length - 1];
    const res = new Channel_1.YouTubeChannel({
        id: data.channelRenderer.channelId,
        name: data.channelRenderer.title.simpleText,
        icon: {
            url: thumbnail.url.replace('//', 'https://'),
            width: thumbnail.width,
            height: thumbnail.height
        },
        url: url,
        verified: Boolean(badge?.includes('verified')),
        artist: Boolean(badge?.includes('artist')),
        subscribers: data.channelRenderer.subscriberCountText?.simpleText ?? '0 subscribers'
    });
    return res;
}
exports.parseChannel = parseChannel;
/**
 * Function to parse Video searches
 * @param data body of that video request.
 * @returns YouTubeVideo class
 */
function parseVideo(data) {
    if (!data || !data.videoRenderer)
        throw new Error('Failed to Parse YouTube Video');
    const channel = data.videoRenderer.ownerText.runs[0];
    const badge = data.videoRenderer.ownerBadges?.[0]?.metadataBadgeRenderer?.style?.toLowerCase();
    const durationText = data.videoRenderer.lengthText;
    const res = new Video_1.YouTubeVideo({
        id: data.videoRenderer.videoId,
        url: `https://www.youtube.com/watch?v=${data.videoRenderer.videoId}`,
        title: data.videoRenderer.title.runs[0].text,
        description: data.videoRenderer.detailedMetadataSnippets?.[0].snippetText.runs?.length
            ? data.videoRenderer.detailedMetadataSnippets[0].snippetText.runs.map((run) => run.text).join('')
            : '',
        duration: durationText ? parseDuration(durationText.simpleText) : 0,
        duration_raw: durationText ? durationText.simpleText : null,
        thumbnails: data.videoRenderer.thumbnail.thumbnails,
        channel: {
            id: channel.navigationEndpoint.browseEndpoint.browseId || null,
            name: channel.text || null,
            url: `https://www.youtube.com${channel.navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
                channel.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
            icons: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail
                .thumbnails,
            verified: Boolean(badge?.includes('verified')),
            artist: Boolean(badge?.includes('artist'))
        },
        uploadedAt: data.videoRenderer.publishedTimeText?.simpleText ?? null,
        upcoming: data.videoRenderer.upcomingEventData?.startTime
            ? new Date(parseInt(data.videoRenderer.upcomingEventData.startTime) * 1000)
            : undefined,
        views: data.videoRenderer.viewCountText?.simpleText?.replace(/\D/g, '') ?? 0,
        live: durationText ? false : true
    });
    return res;
}
exports.parseVideo = parseVideo;
/**
 * Function to parse Playlist searches
 * @param data body of that playlist request.
 * @returns YouTubePlaylist class
 */
function parsePlaylist(data) {
    if (!data || !data.playlistRenderer)
        throw new Error('Failed to Parse YouTube Playlist');
    const thumbnail = data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1];
    const channel = data.playlistRenderer.shortBylineText.runs?.[0];
    const res = new Playlist_1.YouTubePlayList({
        id: data.playlistRenderer.playlistId,
        title: data.playlistRenderer.title.simpleText,
        thumbnail: {
            id: data.playlistRenderer.playlistId,
            url: thumbnail.url,
            height: thumbnail.height,
            width: thumbnail.width
        },
        channel: {
            id: channel?.navigationEndpoint.browseEndpoint.browseId,
            name: channel?.text,
            url: `https://www.youtube.com${channel?.navigationEndpoint.commandMetadata.webCommandMetadata.url}`
        },
        videos: parseInt(data.playlistRenderer.videoCount.replace(/\D/g, ''))
    }, true);
    return res;
}
exports.parsePlaylist = parsePlaylist;
function unblurThumbnail(thumbnail) {
    if (BLURRED_THUMBNAILS.find((sqp) => thumbnail.url.includes(sqp))) {
        thumbnail.url = thumbnail.url.split('?')[0];
        // we need to update the size parameters as the sqp parameter also included a cropped size
        switch (thumbnail.url.split('/').at(-1).split('.')[0]) {
            case 'hq2':
            case 'hqdefault':
                thumbnail.width = 480;
                thumbnail.height = 360;
                break;
            case 'hq720':
                thumbnail.width = 1280;
                thumbnail.height = 720;
                break;
            case 'sddefault':
                thumbnail.width = 640;
                thumbnail.height = 480;
                break;
            case 'mqdefault':
                thumbnail.width = 320;
                thumbnail.height = 180;
                break;
            case 'default':
                thumbnail.width = 120;
                thumbnail.height = 90;
                break;
            default:
                thumbnail.width = thumbnail.height = NaN;
        }
    }
}
//# sourceMappingURL=parser.js.map