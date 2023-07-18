"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundCloudStream = exports.SoundCloudPlaylist = exports.SoundCloudTrack = exports.setSoundCloudToken = exports.so_validate = exports.check_id = exports.stream_from_info = exports.getFreeClientID = exports.stream = exports.so_search = exports.soundcloud = void 0;
const node_fs_1 = require("node:fs");
const stream_1 = require("../YouTube/stream");
const Request_1 = require("../Request");
const classes_1 = require("./classes");
Object.defineProperty(exports, "SoundCloudPlaylist", { enumerable: true, get: function () { return classes_1.SoundCloudPlaylist; } });
Object.defineProperty(exports, "SoundCloudTrack", { enumerable: true, get: function () { return classes_1.SoundCloudTrack; } });
Object.defineProperty(exports, "SoundCloudStream", { enumerable: true, get: function () { return classes_1.SoundCloudStream; } });
let soundData;
if ((0, node_fs_1.existsSync)('.data/soundcloud.data')) {
    soundData = JSON.parse((0, node_fs_1.readFileSync)('.data/soundcloud.data', 'utf-8'));
}
const pattern = /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(api\.soundcloud\.com|soundcloud\.com|snd\.sc)\/(.*)$/;
/**
 * Gets info from a soundcloud url.
 *
 * ```ts
 * let sound = await play.soundcloud('soundcloud url')
 *
 * // sound.type === "track" | "playlist" | "user"
 *
 * if (sound.type === "track") {
 *      spot = spot as play.SoundCloudTrack
 *      // Code with SoundCloud track class.
 * }
 * ```
 * @param url soundcloud url
 * @returns A {@link SoundCloudTrack} or {@link SoundCloudPlaylist}
 */
async function soundcloud(url) {
    if (!soundData)
        throw new Error('SoundCloud Data is missing\nDid you forget to do authorization ?');
    const url_ = url.trim();
    if (!url_.match(pattern))
        throw new Error('This is not a SoundCloud URL');
    const data = await (0, Request_1.request)(`https://api-v2.soundcloud.com/resolve?url=${url_}&client_id=${soundData.client_id}`).catch((err) => err);
    if (data instanceof Error)
        throw data;
    const json_data = JSON.parse(data);
    if (json_data.kind !== 'track' && json_data.kind !== 'playlist')
        throw new Error('This url is out of scope for play-dl.');
    if (json_data.kind === 'track')
        return new classes_1.SoundCloudTrack(json_data);
    else
        return new classes_1.SoundCloudPlaylist(json_data, soundData.client_id);
}
exports.soundcloud = soundcloud;
/**
 * Function for searching in SoundCloud
 * @param query query to search
 * @param type 'tracks' | 'playlists' | 'albums'
 * @param limit max no. of results
 * @returns Array of SoundCloud type.
 */
async function so_search(query, type, limit = 10) {
    const response = await (0, Request_1.request)(`https://api-v2.soundcloud.com/search/${type}?q=${query}&client_id=${soundData.client_id}&limit=${limit}`);
    const results = [];
    const json_data = JSON.parse(response);
    json_data.collection.forEach((x) => {
        if (type === 'tracks')
            results.push(new classes_1.SoundCloudTrack(x));
        else
            results.push(new classes_1.SoundCloudPlaylist(x, soundData.client_id));
    });
    return results;
}
exports.so_search = so_search;
/**
 * Main Function for creating a Stream of soundcloud
 * @param url soundcloud url
 * @param quality Quality to select from
 * @returns SoundCloud Stream
 */
async function stream(url, quality) {
    const data = await soundcloud(url);
    if (data instanceof classes_1.SoundCloudPlaylist)
        throw new Error("Streams can't be created from playlist urls");
    const HLSformats = parseHlsFormats(data.formats);
    if (typeof quality !== 'number')
        quality = HLSformats.length - 1;
    else if (quality <= 0)
        quality = 0;
    else if (quality >= HLSformats.length)
        quality = HLSformats.length - 1;
    const req_url = HLSformats[quality].url + '?client_id=' + soundData.client_id;
    const s_data = JSON.parse(await (0, Request_1.request)(req_url));
    const type = HLSformats[quality].format.mime_type.startsWith('audio/ogg')
        ? stream_1.StreamType.OggOpus
        : stream_1.StreamType.Arbitrary;
    return new classes_1.SoundCloudStream(s_data.url, type);
}
exports.stream = stream;
/**
 * Gets Free SoundCloud Client ID.
 *
 * Use this in beginning of your code to add SoundCloud support.
 *
 * ```ts
 * play.getFreeClientID().then((clientID) => play.setToken({
 *      soundcloud : {
 *          client_id : clientID
 *      }
 * }))
 * ```
 * @returns client ID
 */
async function getFreeClientID() {
    const data = await (0, Request_1.request)('https://soundcloud.com/');
    const splitted = data.split('<script crossorigin src="');
    const urls = [];
    splitted.forEach((r) => {
        if (r.startsWith('https')) {
            urls.push(r.split('"')[0]);
        }
    });
    const data2 = await (0, Request_1.request)(urls[urls.length - 1]);
    return data2.split(',client_id:"')[1].split('"')[0];
}
exports.getFreeClientID = getFreeClientID;
/**
 * Function for creating a Stream of soundcloud using a SoundCloud Track Class
 * @param data SoundCloud Track Class
 * @param quality Quality to select from
 * @returns SoundCloud Stream
 */
async function stream_from_info(data, quality) {
    const HLSformats = parseHlsFormats(data.formats);
    if (typeof quality !== 'number')
        quality = HLSformats.length - 1;
    else if (quality <= 0)
        quality = 0;
    else if (quality >= HLSformats.length)
        quality = HLSformats.length - 1;
    const req_url = HLSformats[quality].url + '?client_id=' + soundData.client_id;
    const s_data = JSON.parse(await (0, Request_1.request)(req_url));
    const type = HLSformats[quality].format.mime_type.startsWith('audio/ogg')
        ? stream_1.StreamType.OggOpus
        : stream_1.StreamType.Arbitrary;
    return new classes_1.SoundCloudStream(s_data.url, type);
}
exports.stream_from_info = stream_from_info;
/**
 * Function to check client ID
 * @param id Client ID
 * @returns boolean
 */
async function check_id(id) {
    const response = await (0, Request_1.request)(`https://api-v2.soundcloud.com/search?client_id=${id}&q=Rick+Roll&limit=0`).catch((err) => {
        return err;
    });
    if (response instanceof Error)
        return false;
    else
        return true;
}
exports.check_id = check_id;
/**
 * Validates a soundcloud url
 * @param url soundcloud url
 * @returns
 * ```ts
 * false | 'track' | 'playlist'
 * ```
 */
async function so_validate(url) {
    const url_ = url.trim();
    if (!url_.startsWith('https'))
        return 'search';
    if (!url_.match(pattern))
        return false;
    const data = await (0, Request_1.request)(`https://api-v2.soundcloud.com/resolve?url=${url_}&client_id=${soundData.client_id}`).catch((err) => err);
    if (data instanceof Error)
        return false;
    const json_data = JSON.parse(data);
    if (json_data.kind === 'track')
        return 'track';
    else if (json_data.kind === 'playlist')
        return 'playlist';
    else
        return false;
}
exports.so_validate = so_validate;
/**
 * Function to select only hls streams from SoundCloud format array
 * @param data SoundCloud Track Format data
 * @returns HLS Formats Array
 */
function parseHlsFormats(data) {
    const result = [];
    data.forEach((format) => {
        if (format.format.protocol === 'hls')
            result.push(format);
    });
    return result;
}
function setSoundCloudToken(options) {
    soundData = options;
}
exports.setSoundCloudToken = setSoundCloudToken;
//# sourceMappingURL=index.js.map