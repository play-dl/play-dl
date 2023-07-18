"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream_from_info = exports.stream = exports.parseAudioFormats = exports.StreamType = void 0;
const Request_1 = require("../Request");
const LiveStream_1 = require("./classes/LiveStream");
const SeekStream_1 = require("./classes/SeekStream");
const extractor_1 = require("./utils/extractor");
const node_url_1 = require("node:url");
var StreamType;
(function (StreamType) {
    StreamType["Arbitrary"] = "arbitrary";
    StreamType["Raw"] = "raw";
    StreamType["OggOpus"] = "ogg/opus";
    StreamType["WebmOpus"] = "webm/opus";
    StreamType["Opus"] = "opus";
})(StreamType = exports.StreamType || (exports.StreamType = {}));
/**
 * Command to find audio formats from given format array
 * @param formats Formats to search from
 * @returns Audio Formats array
 */
function parseAudioFormats(formats) {
    const result = [];
    formats.forEach((format) => {
        const type = format.mimeType;
        if (type.startsWith('audio')) {
            format.codec = type.split('codecs="')[1].split('"')[0];
            format.container = type.split('audio/')[1].split(';')[0];
            result.push(format);
        }
    });
    return result;
}
exports.parseAudioFormats = parseAudioFormats;
/**
 * Stream command for YouTube
 * @param url YouTube URL
 * @param options lets you add quality for stream
 * @returns Stream class with type and stream for playing.
 */
async function stream(url, options = {}) {
    const info = await (0, extractor_1.video_stream_info)(url, { htmldata: options.htmldata, language: options.language });
    return await stream_from_info(info, options);
}
exports.stream = stream;
/**
 * Stream command for YouTube using info from video_info or decipher_info function.
 * @param info video_info data
 * @param options lets you add quality for stream
 * @returns Stream class with type and stream for playing.
 */
async function stream_from_info(info, options = {}) {
    if (info.format.length === 0)
        throw new Error('Upcoming and premiere videos that are not currently live cannot be streamed.');
    if (options.quality && !Number.isInteger(options.quality))
        throw new Error('Quality must be set to an integer.');
    const final = [];
    if (info.LiveStreamData.isLive === true &&
        info.LiveStreamData.dashManifestUrl !== null &&
        info.video_details.durationInSec === 0) {
        return new LiveStream_1.LiveStream(info.LiveStreamData.dashManifestUrl, info.format[info.format.length - 1].targetDurationSec, info.video_details.url, options.precache);
    }
    const audioFormat = parseAudioFormats(info.format);
    if (typeof options.quality !== 'number')
        options.quality = audioFormat.length - 1;
    else if (options.quality <= 0)
        options.quality = 0;
    else if (options.quality >= audioFormat.length)
        options.quality = audioFormat.length - 1;
    if (audioFormat.length !== 0)
        final.push(audioFormat[options.quality]);
    else
        final.push(info.format[info.format.length - 1]);
    let type = final[0].codec === 'opus' && final[0].container === 'webm' ? StreamType.WebmOpus : StreamType.Arbitrary;
    await (0, Request_1.request_stream)(`https://${new node_url_1.URL(final[0].url).host}/generate_204`);
    if (type === StreamType.WebmOpus) {
        if (!options.discordPlayerCompatibility) {
            options.seek ??= 0;
            if (options.seek >= info.video_details.durationInSec || options.seek < 0)
                throw new Error(`Seeking beyond limit. [ 0 - ${info.video_details.durationInSec - 1}]`);
            return new SeekStream_1.SeekStream(final[0].url, info.video_details.durationInSec, final[0].indexRange.end, Number(final[0].contentLength), Number(final[0].bitrate), info.video_details.url, options);
        }
        else if (options.seek)
            throw new Error('Can not seek with discordPlayerCompatibility set to true.');
    }
    let contentLength;
    if (final[0].contentLength) {
        contentLength = Number(final[0].contentLength);
    }
    else {
        contentLength = await (0, Request_1.request_content_length)(final[0].url);
    }
    return new LiveStream_1.Stream(final[0].url, type, info.video_details.durationInSec, contentLength, info.video_details.url, options);
}
exports.stream_from_info = stream_from_info;
//# sourceMappingURL=stream.js.map