import https, { RequestOptions } from 'https';
import { IncomingMessage } from 'http';
import { URL } from 'url';

interface ProxyOpts {
    host : string,
    port : number,
    authentication? : {
        username : string;
        password : string;
    }
}

interface RequestOpts extends RequestOptions {
    body?: string;
    method?: 'GET' | 'POST';
    proxies? : string[] | ProxyOpts[]
}

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

export async function request(url: string, options?: RequestOpts): Promise<string> {
    return new Promise(async (resolve, reject) => {
        let data = '';
        let res = await https_getter(url, options).catch((err: Error) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        if (Number(res.statusCode) >= 300 && Number(res.statusCode) < 400) {
            res = await https_getter(res.headers.location as string, options);
        } else if (Number(res.statusCode) > 400) {
            reject(new Error(`Got ${res.statusCode} from the request`));
        }
        res.setEncoding('utf-8');
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
    });
}

export async function request_stream(url: string, options?: RequestOpts): Promise<IncomingMessage> {
    return new Promise(async (resolve, reject) => {
        let res = await https_getter(url, options).catch((err: Error) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        if (Number(res.statusCode) >= 300 && Number(res.statusCode) < 400) {
            res = await https_getter(res.headers.location as string, options);
        }
        resolve(res);
    });
}
