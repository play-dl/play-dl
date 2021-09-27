import { YouTubeVideo } from '../classes/Video';
import { YouTubePlayList } from '../classes/Playlist';
import { YouTubeChannel } from '../classes/Channel';

export interface ParseSearchInterface {
    type?: 'video' | 'playlist' | 'channel';
    limit?: number;
}

export interface thumbnail {
    width: string;
    height: string;
    url: string;
}

export function ParseSearchResult(
    html: string,
    options?: ParseSearchInterface
): (YouTubeVideo | YouTubePlayList | YouTubeChannel)[] {
    if (!html) throw new Error("Can't parse Search result without data");
    if (!options) options = { type: 'video', limit: 0 };
    if (!options.type) options.type = 'video';

    const data = html.split('var ytInitialData = ')[1].split('}};')[0] + '}}';
    const json_data = JSON.parse(data);
    const results = [];
    const details =
        json_data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0]
            .itemSectionRenderer.contents;
    for (let i = 0; i < details.length; i++) {
        if (typeof options.limit === 'number' && options.limit > 0 && results.length >= options.limit) break;
        if (options.type === 'video') {
            const parsed = parseVideo(details[i]);
            if (!parsed) continue;
            results.push(parsed);
        } else if (options.type === 'channel') {
            const parsed = parseChannel(details[i]);
            if (!parsed) continue;
            results.push(parsed);
        } else if (options.type === 'playlist') {
            const parsed = parsePlaylist(details[i]);
            if (!parsed) continue;
            results.push(parsed);
        }
    }
    return results;
}

function parseDuration(duration: string): number {
    duration ??= '0:00';
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

export function parseChannel(data?: any): YouTubeChannel {
    if (!data || !data.channelRenderer) throw new Error('Failed to Parse YouTube Channel');
    const badge = data.channelRenderer.ownerBadges && data.channelRenderer.ownerBadges[0];
    const url = `https://www.youtube.com${
        data.channelRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
        data.channelRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url
    }`;
    const res = new YouTubeChannel({
        id: data.channelRenderer.channelId,
        name: data.channelRenderer.title.simpleText,
        icon: {
            url: data.channelRenderer.thumbnail.thumbnails[
                data.channelRenderer.thumbnail.thumbnails.length - 1
            ].url.replace('//', 'https://'),
            width: data.channelRenderer.thumbnail.thumbnails[data.channelRenderer.thumbnail.thumbnails.length - 1]
                .width,
            height: data.channelRenderer.thumbnail.thumbnails[data.channelRenderer.thumbnail.thumbnails.length - 1]
                .height
        },
        url: url,
        verified: Boolean(badge?.metadataBadgeRenderer?.style?.toLowerCase().includes('verified')),
        subscribers: data.channelRenderer.subscriberCountText?.simpleText
            ? data.channelRenderer.subscriberCountText.simpleText
            : '0 subscribers'
    });

    return res;
}

export function parseVideo(data?: any): YouTubeVideo {
    if (!data || !data.videoRenderer) throw new Error('Failed to Parse YouTube Video');

    const badge = data.videoRenderer.ownerBadges && data.videoRenderer.ownerBadges[0];
    const res = new YouTubeVideo({
        id: data.videoRenderer.videoId,
        url: `https://www.youtube.com/watch?v=${data.videoRenderer.videoId}`,
        title: data.videoRenderer.title.runs[0].text,
        description:
            data.videoRenderer.descriptionSnippet && data.videoRenderer.descriptionSnippet.runs[0]
                ? data.videoRenderer.descriptionSnippet.runs[0].text
                : '',
        duration: data.videoRenderer.lengthText ? parseDuration(data.videoRenderer.lengthText.simpleText) : 0,
        duration_raw: data.videoRenderer.lengthText ? data.videoRenderer.lengthText.simpleText : null,
        thumbnail: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1],
        channel: {
            id: data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId || null,
            name: data.videoRenderer.ownerText.runs[0].text || null,
            url: `https://www.youtube.com${
                data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
                data.videoRenderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url
            }`,
            icon: {
                url: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail
                    .thumbnails[0].url,
                width: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail
                    .thumbnails[0].width,
                height: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail
                    .thumbnails[0].height
            },
            verified: Boolean(badge?.metadataBadgeRenderer?.style?.toLowerCase().includes('verified'))
        },
        uploadedAt: data.videoRenderer.publishedTimeText?.simpleText ?? null,
        views: data.videoRenderer.viewCountText?.simpleText?.replace(/[^0-9]/g, '') ?? 0,
        live: data.videoRenderer.lengthText ? false : true
    });

    return res;
}

export function parsePlaylist(data?: any): YouTubePlayList {
    if (!data.playlistRenderer) throw new Error('Failed to Parse YouTube Playlist');

    const res = new YouTubePlayList(
        {
            id: data.playlistRenderer.playlistId,
            title: data.playlistRenderer.title.simpleText,
            thumbnail: {
                id: data.playlistRenderer.playlistId,
                url: data.playlistRenderer.thumbnails[0].thumbnails[
                    data.playlistRenderer.thumbnails[0].thumbnails.length - 1
                ].url,
                height: data.playlistRenderer.thumbnails[0].thumbnails[
                    data.playlistRenderer.thumbnails[0].thumbnails.length - 1
                ].height,
                width: data.playlistRenderer.thumbnails[0].thumbnails[
                    data.playlistRenderer.thumbnails[0].thumbnails.length - 1
                ].width
            },
            channel: {
                id: data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                name: data.playlistRenderer.shortBylineText.runs[0].text,
                url: `https://www.youtube.com${data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`
            },
            videos: parseInt(data.playlistRenderer.videoCount.replace(/[^0-9]/g, ''))
        },
        true
    );

    return res;
}
