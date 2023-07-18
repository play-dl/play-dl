"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieHeaders = exports.setCookieToken = exports.uploadCookie = exports.setCookie = exports.getCookies = void 0;
const node_fs_1 = require("node:fs");
let youtubeData;
if ((0, node_fs_1.existsSync)('.data/youtube.data')) {
    youtubeData = JSON.parse((0, node_fs_1.readFileSync)('.data/youtube.data', 'utf-8'));
    youtubeData.file = true;
}
function getCookies() {
    let result = '';
    if (!youtubeData?.cookie)
        return undefined;
    for (const [key, value] of Object.entries(youtubeData.cookie)) {
        result += `${key}=${value};`;
    }
    return result;
}
exports.getCookies = getCookies;
function setCookie(key, value) {
    if (!youtubeData?.cookie)
        return false;
    key = key.trim();
    value = value.trim();
    Object.assign(youtubeData.cookie, { [key]: value });
    return true;
}
exports.setCookie = setCookie;
function uploadCookie() {
    if (youtubeData.cookie && youtubeData.file)
        (0, node_fs_1.writeFileSync)('.data/youtube.data', JSON.stringify(youtubeData, undefined, 4));
}
exports.uploadCookie = uploadCookie;
function setCookieToken(options) {
    let cook = options.cookie;
    let cookie = {};
    cook.split(';').forEach((x) => {
        const arr = x.split('=');
        if (arr.length <= 1)
            return;
        const key = arr.shift()?.trim();
        const value = arr.join('=').trim();
        Object.assign(cookie, { [key]: value });
    });
    youtubeData = { cookie };
    youtubeData.file = false;
}
exports.setCookieToken = setCookieToken;
/**
 * Updates cookies locally either in file or in memory.
 *
 * Example
 * ```ts
 * const response = ... // Any https package get function.
 *
 * play.cookieHeaders(response.headers['set-cookie'])
 * ```
 * @param headCookie response headers['set-cookie'] array
 * @returns Nothing
 */
function cookieHeaders(headCookie) {
    if (!youtubeData?.cookie)
        return;
    headCookie.forEach((x) => {
        x.split(';').forEach((z) => {
            const arr = z.split('=');
            if (arr.length <= 1)
                return;
            const key = arr.shift()?.trim();
            const value = arr.join('=').trim();
            setCookie(key, value);
        });
    });
    uploadCookie();
}
exports.cookieHeaders = cookieHeaders;
//# sourceMappingURL=cookie.js.map