import { request as httpsRequest, RequestOptions } from 'node:https';
import { IncomingMessage } from 'node:http';
import { BrotliDecompress, Deflate, Gunzip, createGunzip, createBrotliDecompress, createDeflate } from 'node:zlib';
import { URL } from 'node:url';

interface RequestOpts extends RequestOptions {
    body?: string;
    method?: 'GET' | 'POST' | 'HEAD';
    headers?: {
        [key: string]: string | number;
    };
}

interface request_return {
    error?: string;
    data?: string;
}

interface https_return {
    error?: string;
    data?: IncomingMessage;
}

export function request(req_url: string, options: RequestOpts = { method: 'GET' }): Promise<request_return> {
    return new Promise(async (resolve) => {
        options.headers = {
            ...options.headers,
            'accept-encoding': 'gzip, deflate, br'
        };
        let res = await https_getter(req_url, options);
        if (res.data && res.data.headers.location) res = await redirect(res.data.headers.location, options);
        if (res.data) {
            if (Number(res.data.statusCode) >= 400) {
                resolve({ error: `Request Status Code : ${res.data.statusCode}` });
                return;
            }
            const data: string[] = [];
            const encoding = res.data.headers['content-encoding'];
            let decoder: BrotliDecompress | Gunzip | Deflate | undefined = undefined;
            if (encoding === 'gzip') decoder = createGunzip();
            else if (encoding === 'br') decoder = createBrotliDecompress();
            else if (encoding === 'deflate') decoder = createDeflate();

            if (decoder) {
                res.data.pipe(decoder);
                decoder.setEncoding('utf-8');
                decoder.on('data', (c) => data.push(c));
                decoder.on('end', () => resolve({ data: data.join('') }));
            } else {
                res.data.setEncoding('utf-8');
                res.data.on('data', (c) => data.push(c));
                res.data.on('end', () => resolve({ data: data.join('') }));
            }
        } else resolve({ error: res.error ?? 'UNKNOWN REQUEST ERROR' });
    });
}

export async function request_stream(req_url: string, options: RequestOpts = { method: 'GET' }): Promise<https_return> {
    let res = await https_getter(req_url, options);
    if (res.error) {
        return { error: res.error };
    } else if (res.data) {
        if (Number(res.data.statusCode) >= 300 && Number(res.data.statusCode) < 400) {
            res = await redirect(res.data.headers.location as string, options);
        }
        return res;
    } else return { error: 'UNKNOWN HTTP ERROR' };
}

async function redirect(req_url: string, options: RequestOpts = {}): Promise<https_return> {
    const res = await https_getter(req_url, options);
    if (res.data && res.data.headers.location) {
        return redirect(res.data.headers.location, options);
    } else return res;
}

function https_getter(req_url: string, options: RequestOpts = {}): Promise<https_return> {
    return new Promise((resolve) => {
        const s = new URL(req_url);
        options.method ??= 'GET';
        const req_options: RequestOptions = {
            host: s.hostname,
            path: s.pathname + s.search,
            headers: options.headers ?? {},
            method: options.method
        };

        const req = httpsRequest(req_options, (res) => resolve({ data: res }));
        req.on('error', (err) => resolve({ error: err.message }));
        if (options.method === 'POST') req.write(options.body);
        req.end();
    });
}
