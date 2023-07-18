"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeezerPlaylist = exports.DeezerAlbum = exports.DeezerTrack = exports.dz_advanced_track_search = exports.dz_search = exports.dz_validate = exports.deezer = void 0;
const node_url_1 = require("node:url");
const Request_1 = require("../Request");
const classes_1 = require("./classes");
Object.defineProperty(exports, "DeezerAlbum", { enumerable: true, get: function () { return classes_1.DeezerAlbum; } });
Object.defineProperty(exports, "DeezerPlaylist", { enumerable: true, get: function () { return classes_1.DeezerPlaylist; } });
Object.defineProperty(exports, "DeezerTrack", { enumerable: true, get: function () { return classes_1.DeezerTrack; } });
async function internalValidate(url) {
    let urlObj;
    try {
        // will throw a TypeError if the input is not a valid URL so we need to catch it
        urlObj = new node_url_1.URL(url);
    }
    catch {
        return { type: 'search' };
    }
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
        return { type: 'search' };
    }
    let pathname = urlObj.pathname;
    if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }
    const path = pathname.split('/');
    switch (urlObj.hostname) {
        case 'deezer.com':
        case 'www.deezer.com': {
            if (path.length === 4) {
                const lang = path.splice(1, 1)[0];
                if (!lang.match(/^[a-z]{2}$/)) {
                    return { type: false };
                }
            }
            else if (path.length !== 3) {
                return { type: false };
            }
            if ((path[1] === 'track' || path[1] === 'album' || path[1] === 'playlist') && path[2].match(/^\d+$/)) {
                return {
                    type: path[1],
                    id: path[2]
                };
            }
            else {
                return { type: false };
            }
        }
        case 'api.deezer.com': {
            if (path.length === 3 &&
                (path[1] === 'track' || path[1] === 'album' || path[1] === 'playlist') &&
                path[2].match(/^\d+$/)) {
                return {
                    type: path[1],
                    id: path[2]
                };
            }
            else {
                return { type: false };
            }
        }
        case 'deezer.page.link': {
            if (path.length === 2 && path[1].match(/^[A-Za-z0-9]+$/)) {
                const resolved = await (0, Request_1.request_resolve_redirect)(url).catch((err) => err);
                if (resolved instanceof Error) {
                    return { type: false, error: resolved.message };
                }
                return await internalValidate(resolved);
            }
            else {
                return { type: false };
            }
        }
        default:
            return { type: 'search' };
    }
}
/**
 * Fetches the information for a track, playlist or album on Deezer
 * @param url The track, playlist or album URL
 * @returns A {@link DeezerTrack}, {@link DeezerPlaylist} or {@link DeezerAlbum}
 * object depending on the provided URL.
 */
async function deezer(url) {
    const typeData = await internalValidate(url.trim());
    if (typeData.error) {
        throw new Error(`This is not a Deezer track, playlist or album URL:\n${typeData.error}`);
    }
    else if (!typeData.type || typeData.type === 'search')
        throw new Error('This is not a Deezer track, playlist or album URL');
    const response = await (0, Request_1.request)(`https://api.deezer.com/${typeData.type}/${typeData.id}`).catch((err) => err);
    if (response instanceof Error)
        throw response;
    const jsonData = JSON.parse(response);
    if (jsonData.error) {
        throw new Error(`Deezer API Error: ${jsonData.error.type}: ${jsonData.error.message}`);
    }
    switch (typeData.type) {
        case 'track':
            return new classes_1.DeezerTrack(jsonData, false);
        case 'playlist':
            return new classes_1.DeezerPlaylist(jsonData, false);
        case 'album':
            return new classes_1.DeezerAlbum(jsonData, false);
    }
}
exports.deezer = deezer;
/**
 * Validates a Deezer URL
 * @param url The URL to validate
 * @returns The type of the URL either `'track'`, `'playlist'`, `'album'`, `'search'` or `false`.
 * `false` means that the provided URL was a wrongly formatted or an unsupported Deezer URL.
 */
async function dz_validate(url) {
    const typeData = await internalValidate(url.trim());
    return typeData.type;
}
exports.dz_validate = dz_validate;
/**
 * Searches Deezer for tracks, playlists or albums
 * @param query The search query
 * @param options Extra options to configure the search:
 *
 * * type?: The type to search for `'track'`, `'playlist'` or `'album'`. Defaults to `'track'`.
 * * limit?: The maximum number of results to return, maximum `100`, defaults to `10`.
 * * fuzzy?: Whether the search should be fuzzy or only return exact matches. Defaults to `true`.
 * @returns An array of tracks, playlists or albums
 */
async function dz_search(query, options) {
    let query_ = query.trim();
    const type = options.type ?? 'track';
    const limit = options.limit ?? 10;
    const fuzzy = options.fuzzy ?? true;
    if (query_.length === 0)
        throw new Error('A query is required to search.');
    if (limit > 100)
        throw new Error('The maximum search limit for Deezer is 100');
    if (limit < 1)
        throw new Error('The minimum search limit for Deezer is 1');
    if (type !== 'track' && type !== 'album' && type != 'playlist')
        throw new Error(`"${type}" is not a valid Deezer search type`);
    query_ = encodeURIComponent(query_);
    const response = await (0, Request_1.request)(`https://api.deezer.com/search/${type}/?q=${query_}&limit=${limit}${fuzzy ? '' : 'strict=on'}`).catch((err) => err);
    if (response instanceof Error)
        throw response;
    const jsonData = JSON.parse(response);
    if (jsonData.error) {
        throw new Error(`Deezer API Error: ${jsonData.error.type}: ${jsonData.error.message}`);
    }
    let results = [];
    switch (type) {
        case 'track':
            results = jsonData.data.map((track) => new classes_1.DeezerTrack(track, true));
            break;
        case 'playlist':
            results = jsonData.data.map((playlist) => new classes_1.DeezerPlaylist(playlist, true));
            break;
        case 'album':
            results = jsonData.data.map((album) => new classes_1.DeezerAlbum(album, true));
            break;
    }
    return results;
}
exports.dz_search = dz_search;
/**
 * Searches Deezer for tracks using the specified metadata.
 * @param options The metadata and limit for the search
 *
 * * limit?: The maximum number of results to return, maximum `100`, defaults to `10`.
 * * artist?: The name of the artist
 * * album?: The title of the album
 * * title?: The title of the track
 * * label?: The label that released the track
 * * minDurationInSec?: The minimum duration in seconds
 * * maxDurationInSec?: The maximum duration in seconds
 * * minBpm?: The minimum BPM
 * * maxBpm?: The minimum BPM
 * @returns An array of tracks matching the metadata
 */
async function dz_advanced_track_search(options) {
    const limit = options.limit ?? 10;
    if (limit > 100)
        throw new Error('The maximum search limit for Deezer is 100');
    if (limit < 1)
        throw new Error('The minimum search limit for Deezer is 1');
    const metadata = [];
    if (options.artist)
        metadata.push(`artist:"${encodeURIComponent(options.artist.trim())}"`);
    if (options.album)
        metadata.push(`album:"${encodeURIComponent(options.album.trim())}"`);
    if (options.title)
        metadata.push(`track:"${encodeURIComponent(options.title.trim())}"`);
    if (options.label)
        metadata.push(`label:"${encodeURIComponent(options.label.trim())}"`);
    if (!isNaN(Number(options.minDurationInSec)))
        metadata.push(`dur_min:${options.minDurationInSec}`);
    if (!isNaN(Number(options.maxDurationInSec)))
        metadata.push(`dur_max:${options.maxDurationInSec}`);
    if (!isNaN(Number(options.minBPM)))
        metadata.push(`bpm_min:${options.minBPM}`);
    if (!isNaN(Number(options.maxBPM)))
        metadata.push(`bpm_max:${options.maxBPM}`);
    if (metadata.length === 0)
        throw new Error('At least one type of metadata is required.');
    const response = await (0, Request_1.request)(`https://api.deezer.com/search/track/?q=${metadata.join(' ')}&limit=${limit}`).catch((err) => err);
    if (response instanceof Error)
        throw response;
    const jsonData = JSON.parse(response);
    if (jsonData.error) {
        throw new Error(`Deezer API Error: ${jsonData.error.type}: ${jsonData.error.message}`);
    }
    const results = jsonData.data.map((track) => new classes_1.DeezerTrack(track, true));
    return results;
}
exports.dz_advanced_track_search = dz_advanced_track_search;
//# sourceMappingURL=index.js.map