"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setToken = void 0;
const useragent_1 = require("./Request/useragent");
const SoundCloud_1 = require("./SoundCloud");
const Spotify_1 = require("./Spotify");
const cookie_1 = require("./YouTube/utils/cookie");
/**
 * Sets
 *
 *  i> YouTube :- cookies.
 *
 *  ii> SoundCloud :- client ID.
 *
 *  iii> Spotify :- client ID, client secret, refresh token, market.
 *
 *  iv> Useragents :- array of string.
 *
 * locally in memory.
 *
 * Example :
 * ```ts
 * play.setToken({
 *      youtube : {
 *          cookie : "Your Cookies"
 *      }
 * }) // YouTube Cookies
 *
 * await play.setToken({
 *      spotify : {
 *          client_id: 'ID',
            client_secret: 'secret',
            refresh_token: 'token',
            market: 'US'
 *      }
 * }) // Await this only when setting data for spotify
 *
 * play.setToken({
 *      useragent: ['Your User-agent']
 * }) // Use this to avoid 429 errors.
 * ```
 * @param options {@link tokenOptions}
 */
async function setToken(options) {
    if (options.spotify)
        await (0, Spotify_1.setSpotifyToken)(options.spotify);
    if (options.soundcloud)
        (0, SoundCloud_1.setSoundCloudToken)(options.soundcloud);
    if (options.youtube)
        (0, cookie_1.setCookieToken)(options.youtube);
    if (options.useragent)
        (0, useragent_1.setUserAgent)(options.useragent);
}
exports.setToken = setToken;
//# sourceMappingURL=token.js.map