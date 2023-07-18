"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyPlaylist = exports.SpotifyAlbum = exports.SpotifyTrack = exports.setSpotifyToken = exports.refreshToken = exports.sp_search = exports.is_expired = exports.SpotifyAuthorize = exports.sp_validate = exports.spotify = void 0;
const Request_1 = require("../Request");
const classes_1 = require("./classes");
Object.defineProperty(exports, "SpotifyAlbum", { enumerable: true, get: function () { return classes_1.SpotifyAlbum; } });
Object.defineProperty(exports, "SpotifyPlaylist", { enumerable: true, get: function () { return classes_1.SpotifyPlaylist; } });
Object.defineProperty(exports, "SpotifyTrack", { enumerable: true, get: function () { return classes_1.SpotifyTrack; } });
const node_fs_1 = require("node:fs");
let spotifyData;
if ((0, node_fs_1.existsSync)('.data/spotify.data')) {
    spotifyData = JSON.parse((0, node_fs_1.readFileSync)('.data/spotify.data', 'utf-8'));
    spotifyData.file = true;
}
const pattern = /^((https:)?\/\/)?open.spotify.com\/(track|album|playlist)\//;
/**
 * Gets Spotify url details.
 *
 * ```ts
 * let spot = await play.spotify('spotify url')
 *
 * // spot.type === "track" | "playlist" | "album"
 *
 * if (spot.type === "track") {
 *      spot = spot as play.SpotifyTrack
 *      // Code with spotify track class.
 * }
 * ```
 * @param url Spotify Url
 * @returns A {@link SpotifyTrack} or {@link SpotifyPlaylist} or {@link SpotifyAlbum}
 */
async function spotify(url) {
    if (!spotifyData)
        throw new Error('Spotify Data is missing\nDid you forgot to do authorization ?');
    const url_ = url.trim();
    if (!url_.match(pattern))
        throw new Error('This is not a Spotify URL');
    if (url_.indexOf('track/') !== -1) {
        const trackID = url_.split('track/')[1].split('&')[0].split('?')[0];
        const response = await (0, Request_1.request)(`https://api.spotify.com/v1/tracks/${trackID}?market=${spotifyData.market}`, {
            headers: {
                Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
            }
        }).catch((err) => {
            return err;
        });
        if (response instanceof Error)
            throw response;
        return new classes_1.SpotifyTrack(JSON.parse(response));
    }
    else if (url_.indexOf('album/') !== -1) {
        const albumID = url.split('album/')[1].split('&')[0].split('?')[0];
        const response = await (0, Request_1.request)(`https://api.spotify.com/v1/albums/${albumID}?market=${spotifyData.market}`, {
            headers: {
                Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
            }
        }).catch((err) => {
            return err;
        });
        if (response instanceof Error)
            throw response;
        return new classes_1.SpotifyAlbum(JSON.parse(response), spotifyData, false);
    }
    else if (url_.indexOf('playlist/') !== -1) {
        const playlistID = url.split('playlist/')[1].split('&')[0].split('?')[0];
        const response = await (0, Request_1.request)(`https://api.spotify.com/v1/playlists/${playlistID}?market=${spotifyData.market}`, {
            headers: {
                Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
            }
        }).catch((err) => {
            return err;
        });
        if (response instanceof Error)
            throw response;
        return new classes_1.SpotifyPlaylist(JSON.parse(response), spotifyData, false);
    }
    else
        throw new Error('URL is out of scope for play-dl.');
}
exports.spotify = spotify;
/**
 * Validate Spotify url
 * @param url Spotify URL
 * @returns
 * ```ts
 * 'track' | 'playlist' | 'album' | 'search' | false
 * ```
 */
function sp_validate(url) {
    const url_ = url.trim();
    if (!url_.startsWith('https'))
        return 'search';
    if (!url_.match(pattern))
        return false;
    if (url_.indexOf('track/') !== -1) {
        return 'track';
    }
    else if (url_.indexOf('album/') !== -1) {
        return 'album';
    }
    else if (url_.indexOf('playlist/') !== -1) {
        return 'playlist';
    }
    else
        return false;
}
exports.sp_validate = sp_validate;
/**
 * Fuction for authorizing for spotify data.
 * @param data Sportify Data options to validate
 * @returns boolean.
 */
async function SpotifyAuthorize(data, file, client_flow) {
    if (!client_flow) {
        const response = await (0, Request_1.request)(`https://accounts.spotify.com/api/token`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${data.client_id}:${data.client_secret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=authorization_code&code=${data.authorization_code}&redirect_uri=${encodeURI(data.redirect_url)}`,
            method: 'POST'
        }).catch((err) => {
            return err;
        });
        if (response instanceof Error)
            throw response;
        const resp_json = JSON.parse(response);
        spotifyData = {
            client_id: data.client_id,
            client_secret: data.client_secret,
            redirect_url: data.redirect_url,
            access_token: resp_json.access_token,
            refresh_token: resp_json.refresh_token,
            expires_in: Number(resp_json.expires_in),
            expiry: Date.now() + (resp_json.expires_in - 1) * 1000,
            token_type: resp_json.token_type,
            market: data.market
        };
    }
    else {
        const response = await (0, Request_1.request)(`https://accounts.spotify.com/api/token`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${data.client_id}:${data.client_secret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials`,
            method: 'POST'
        }).catch((err) => {
            return err;
        });
        if (response instanceof Error)
            throw response;
        const resp_json = JSON.parse(response);
        spotifyData = {
            client_id: data.client_id,
            client_secret: data.client_secret,
            access_token: resp_json.access_token,
            expires_in: Number(resp_json.expires_in),
            expiry: Date.now() + (resp_json.expires_in - 1) * 1000,
            token_type: resp_json.token_type,
            market: data.market
        };
    }
    if (file)
        (0, node_fs_1.writeFileSync)('.data/spotify.data', JSON.stringify(spotifyData, undefined, 4));
    else {
        console.log(`Client ID : ${spotifyData.client_id}`);
        console.log(`Client Secret : ${spotifyData.client_secret}`);
        console.log(`Refresh Token : ${spotifyData.refresh_token}`);
        console.log(`Market : ${spotifyData.market}`);
        console.log(`\nPaste above info in setToken function.`);
    }
    return true;
}
exports.SpotifyAuthorize = SpotifyAuthorize;
/**
 * Checks if spotify token is expired or not.
 *
 * Update token if returned false.
 * ```ts
 * if (play.is_expired()) {
 *      await play.refreshToken()
 * }
 * ```
 * @returns boolean
 */
function is_expired() {
    if (Date.now() >= spotifyData.expiry)
        return true;
    else
        return false;
}
exports.is_expired = is_expired;
/**
 * Function for searching songs on Spotify
 * @param query searching query
 * @param type "album" | "playlist" | "track"
 * @param limit max no of results
 * @returns Spotify type.
 */
async function sp_search(query, type, limit = 10) {
    const results = [];
    if (!spotifyData)
        throw new Error('Spotify Data is missing\nDid you forget to do authorization ?');
    if (query.length === 0)
        throw new Error('Pass some query to search.');
    if (limit > 50 || limit < 0)
        throw new Error(`You crossed limit range of Spotify [ 0 - 50 ]`);
    const response = await (0, Request_1.request)(`https://api.spotify.com/v1/search?type=${type}&q=${query}&limit=${limit}&market=${spotifyData.market}`, {
        headers: {
            Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
        }
    }).catch((err) => {
        return err;
    });
    if (response instanceof Error)
        throw response;
    const json_data = JSON.parse(response);
    if (type === 'track') {
        json_data.tracks.items.forEach((track) => {
            results.push(new classes_1.SpotifyTrack(track));
        });
    }
    else if (type === 'album') {
        json_data.albums.items.forEach((album) => {
            results.push(new classes_1.SpotifyAlbum(album, spotifyData, true));
        });
    }
    else if (type === 'playlist') {
        json_data.playlists.items.forEach((playlist) => {
            results.push(new classes_1.SpotifyPlaylist(playlist, spotifyData, true));
        });
    }
    return results;
}
exports.sp_search = sp_search;
/**
 * Refreshes Token
 *
 * ```ts
 * if (play.is_expired()) {
 *      await play.refreshToken()
 * }
 * ```
 * @returns boolean
 */
async function refreshToken() {
    if (spotifyData.refresh_token) {
        const response = await (0, Request_1.request)(`https://accounts.spotify.com/api/token`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${spotifyData.client_id}:${spotifyData.client_secret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=refresh_token&refresh_token=${spotifyData.refresh_token}`,
            method: 'POST'
        }).catch((err) => {
            return err;
        });
        if (response instanceof Error)
            return false;
        const resp_json = JSON.parse(response);
        spotifyData.access_token = resp_json.access_token;
        spotifyData.expires_in = Number(resp_json.expires_in);
        spotifyData.expiry = Date.now() + (resp_json.expires_in - 1) * 1000;
        spotifyData.token_type = resp_json.token_type;
    }
    else {
        const response = await (0, Request_1.request)(`https://accounts.spotify.com/api/token`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${spotifyData.client_id}:${spotifyData.client_secret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials`,
            method: 'POST'
        }).catch((err) => {
            return err;
        });
        if (response instanceof Error)
            return false;
        const resp_json = JSON.parse(response);
        spotifyData.access_token = resp_json.access_token;
        spotifyData.expires_in = Number(resp_json.expires_in);
        spotifyData.expiry = Date.now() + (resp_json.expires_in - 1) * 1000;
        spotifyData.token_type = resp_json.token_type;
    }
    if (spotifyData.file)
        (0, node_fs_1.writeFileSync)('.data/spotify.data', JSON.stringify(spotifyData, undefined, 4));
    return true;
}
exports.refreshToken = refreshToken;
async function setSpotifyToken(options) {
    spotifyData = options;
    spotifyData.file = false;
    await refreshToken();
}
exports.setSpotifyToken = setSpotifyToken;
//# sourceMappingURL=index.js.map