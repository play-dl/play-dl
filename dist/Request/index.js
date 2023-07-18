"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request_content_length = exports.request_resolve_redirect = exports.request = exports.request_stream = void 0;
const node_https_1 = require("node:https");
const node_url_1 = require("node:url");
const node_zlib_1 = require("node:zlib");
const cookie_1 = require("../YouTube/utils/cookie");
const useragent_1 = require("./useragent");
/**
 * Main module which play-dl uses to make a request to stream url.
 * @param url URL to make https request to
 * @param options Request options for https request
 * @returns IncomingMessage from the request
 */
function request_stream(req_url, options = { method: 'GET' }) {
    return new Promise(async (resolve, reject) => {
        let res = await https_getter(req_url, options).catch((err) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        if (Number(res.statusCode) >= 300 && Number(res.statusCode) < 400) {
            res = await request_stream(res.headers.location, options);
        }
        resolve(res);
    });
}
exports.request_stream = request_stream;
/**
 * Makes a request and follows redirects if necessary
 * @param req_url URL to make https request to
 * @param options Request options for https request
 * @returns A promise with the final response object
 */
function internalRequest(req_url, options = { method: 'GET' }) {
    return new Promise(async (resolve, reject) => {
        let res = await https_getter(req_url, options).catch((err) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        if (Number(res.statusCode) >= 300 && Number(res.statusCode) < 400) {
            res = await internalRequest(res.headers.location, options);
        }
        else if (Number(res.statusCode) > 400) {
            reject(new Error(`Got ${res.statusCode} from the request`));
            return;
        }
        resolve(res);
    });
}
/**
 * Main module which play-dl uses to make a request
 * @param url URL to make https request to
 * @param options Request options for https request
 * @returns body of that request
 */
function request(req_url, options = { method: 'GET' }) {
    return new Promise(async (resolve, reject) => {
        let cookies_added = false;
        if (options.cookies) {
            let cook = (0, cookie_1.getCookies)();
            if (typeof cook === 'string' && options.headers) {
                Object.assign(options.headers, { cookie: cook });
                cookies_added = true;
            }
        }
        if (options.cookieJar) {
            const cookies = [];
            for (const cookie of Object.entries(options.cookieJar)) {
                cookies.push(cookie.join('='));
            }
            if (cookies.length !== 0) {
                if (!options.headers)
                    options.headers = {};
                const existingCookies = cookies_added ? `; ${options.headers.cookie}` : '';
                Object.assign(options.headers, { cookie: `${cookies.join('; ')}${existingCookies}` });
            }
        }
        if (options.headers) {
            options.headers = {
                ...options.headers,
                'accept-encoding': 'gzip, deflate, br',
                'user-agent': (0, useragent_1.getRandomUserAgent)()
            };
        }
        const res = await internalRequest(req_url, options).catch((err) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        if (res.headers && res.headers['set-cookie']) {
            if (options.cookieJar) {
                for (const cookie of res.headers['set-cookie']) {
                    const parts = cookie.split(';')[0].trim().split('=');
                    options.cookieJar[parts.shift()] = parts.join('=');
                }
            }
            if (cookies_added) {
                (0, cookie_1.cookieHeaders)(res.headers['set-cookie']);
            }
        }
        const data = [];
        let decoder = undefined;
        const encoding = res.headers['content-encoding'];
        if (encoding === 'gzip')
            decoder = (0, node_zlib_1.createGunzip)();
        else if (encoding === 'br')
            decoder = (0, node_zlib_1.createBrotliDecompress)();
        else if (encoding === 'deflate')
            decoder = (0, node_zlib_1.createDeflate)();
        if (decoder) {
            res.pipe(decoder);
            decoder.setEncoding('utf-8');
            decoder.on('data', (c) => data.push(c));
            decoder.on('end', () => resolve(data.join('')));
        }
        else {
            res.setEncoding('utf-8');
            res.on('data', (c) => data.push(c));
            res.on('end', () => resolve(data.join('')));
        }
    });
}
exports.request = request;
function request_resolve_redirect(url) {
    return new Promise(async (resolve, reject) => {
        let res = await https_getter(url, { method: 'HEAD' }).catch((err) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        const statusCode = Number(res.statusCode);
        if (statusCode < 300) {
            resolve(url);
        }
        else if (statusCode < 400) {
            const resolved = await request_resolve_redirect(res.headers.location).catch((err) => err);
            if (resolved instanceof Error) {
                reject(resolved);
                return;
            }
            resolve(resolved);
        }
        else {
            reject(new Error(`${res.statusCode}: ${res.statusMessage}, ${url}`));
        }
    });
}
exports.request_resolve_redirect = request_resolve_redirect;
function request_content_length(url) {
    return new Promise(async (resolve, reject) => {
        let res = await https_getter(url, { method: 'HEAD' }).catch((err) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        const statusCode = Number(res.statusCode);
        if (statusCode < 300) {
            resolve(Number(res.headers['content-length']));
        }
        else if (statusCode < 400) {
            const newURL = await request_resolve_redirect(res.headers.location).catch((err) => err);
            if (newURL instanceof Error) {
                reject(newURL);
                return;
            }
            const res2 = await request_content_length(newURL).catch((err) => err);
            if (res2 instanceof Error) {
                reject(res2);
                return;
            }
            resolve(res2);
        }
        else {
            reject(new Error(`Failed to get content length with error: ${res.statusCode}, ${res.statusMessage}, ${url}`));
        }
    });
}
exports.request_content_length = request_content_length;
/**
 * Main module that play-dl uses for making a https request
 * @param req_url URL to make https request to
 * @param options Request options for https request
 * @returns Incoming Message from the https request
 */
function https_getter(req_url, options = {}) {
    return new Promise((resolve, reject) => {
        const s = new node_url_1.URL(req_url);
        options.method ??= 'GET';
        const req_options = {
            host: s.hostname,
            path: s.pathname + s.search,
            headers: options.headers ?? {},
            method: options.method
        };
        const req = (0, node_https_1.request)(req_options, resolve);
        req.on('error', (err) => {
            reject(err);
        });
        if (options.method === 'POST')
            req.write(options.body);
        req.end();
    });
}
//# sourceMappingURL=index.js.map