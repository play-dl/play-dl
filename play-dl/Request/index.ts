import { IncomingMessage } from 'node:http';
import https, { RequestOptions } from 'node:https';
import { URL } from 'node:url';
import zlib, { BrotliDecompress, Deflate, Gunzip } from 'node:zlib';
import { cookieHeaders, getCookies } from '../YouTube/utils/cookie';
import { getRandomUserAgent } from './useragent';

interface RequestOpts extends RequestOptions {
    body?: string;
    method?: 'GET' | 'POST' | 'HEAD';
    cookies?: boolean;
}

interface ProxyOpts {
    host: string;
    port: number;
    authentication?: {
        username: string;
        password: string;
    };
}
/**
 * Main module which play-dl uses to make a request to stream url.
 * @param url URL to make https request to
 * @param options Request options for https request
 * @returns IncomingMessage from the request
 */
export function request_stream(req_url: string, options: RequestOpts = { method: 'GET' }): Promise<IncomingMessage> {
    return new Promise(async (resolve, reject) => {
        let res = await https_getter(req_url, options).catch((err: Error) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        if (Number(res.statusCode) >= 300 && Number(res.statusCode) < 400) {
            res = await request_stream(res.headers.location as string, options);
        }
        resolve(res);
    });
}
/**
 * Main module which play-dl uses to make a proxy or normal request
 * @param url URL to make https request to
 * @param options Request options for https request
 * @returns body of that request
 */
export function request(req_url: string, options: RequestOpts = { method: 'GET' }): Promise<string> {
    return new Promise(async (resolve, reject) => {
        let cookies_added = false;
        if (options.cookies) {
            let cook = getCookies();
            if (typeof cook === 'string' && options.headers) {
                Object.assign(options.headers, { cookie: cook });
                cookies_added = true;
            }
        }
        if (options.headers) {
            options.headers = {
                ...options.headers,
                'accept-encoding': 'gzip, deflate, br',
                'user-agent': getRandomUserAgent()
            };
        }
        let res = await https_getter(req_url, options).catch((err: Error) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        if (res.headers && res.headers['set-cookie'] && cookies_added) {
            cookieHeaders(res.headers['set-cookie']);
        }
        if (Number(res.statusCode) >= 300 && Number(res.statusCode) < 400) {
            res = await https_getter(res.headers.location as string, options).catch((err) => err);
            if (res instanceof Error) throw res;
        } else if (Number(res.statusCode) > 400) {
            reject(new Error(`Got ${res.statusCode} from the request`));
        }
        const data: string[] = [];
        let decoder: BrotliDecompress | Gunzip | Deflate;
        const encoding = res.headers['content-encoding'];
        if (encoding === 'gzip') decoder = zlib.createGunzip();
        else if (encoding === 'br') decoder = zlib.createBrotliDecompress();
        else decoder = zlib.createDeflate();

        res.pipe(decoder);
        decoder.setEncoding('utf-8');
        decoder.on('data', (c) => data.push(c));
        decoder.on('end', () => resolve(data.join('')));
    });
}

export function request_resolve_redirect(url: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        let res = await https_getter(url, { method: 'HEAD' }).catch((err: Error) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        const statusCode = Number(res.statusCode);
        if (statusCode < 300) {
            resolve(url);
        } else if (statusCode < 400) {
            const resolved = await request_resolve_redirect(res.headers.location as string).catch((err) => err);

            if (res instanceof Error) {
                reject(res);
                return;
            }

            resolve(resolved);
        } else {
            reject(new Error(`${res.statusCode}: ${res.statusMessage}, ${url}`));
        }
    });
}

/**
 * Main module that play-dl uses for making a https request
 * @param req_url URL to make https request to
 * @param options Request options for https request
 * @returns Incoming Message from the https request
 */
function https_getter(req_url: string, options: RequestOpts = {}): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
        const s = new URL(req_url);
        options.method ??= 'GET';
        const req_options: RequestOptions = {
            host: s.hostname,
            path: s.pathname + s.search,
            headers: options.headers ?? {},
            method: options.method
        };

        const req = https.request(req_options, resolve);
        req.on('error', (err) => {
            reject(err);
        });
        if (options.method === 'POST') req.write(options.body);
        req.end();
    });
}
