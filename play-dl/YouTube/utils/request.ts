import https, { RequestOptions } from 'https';
import tls from 'tls';
import http, { ClientRequest, IncomingMessage } from 'http';
import { URL } from 'url';
/**
 * Types for Proxy
 */
export type Proxy = ProxyOpts | string;

interface ProxyOpts {
    host: string;
    port: number;
    authentication?: {
        username: string;
        password: string;
    };
}

interface ProxyOutput {
    statusCode: number;
    head: string;
    body: string;
}

interface RequestOpts extends RequestOptions {
    body?: string;
    method?: 'GET' | 'POST';
    proxies?: Proxy[];
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
/**
 * Chooses one random number between max and min number.
 * @param min Minimum number
 * @param max Maximum number
 * @returns Random Number
 */
function randomIntFromInterval(min: number, max: number): number {
    let x = Math.floor(Math.random() * (max - min + 1) + min);
    if (x === 0) return 0;
    else return x - 1;
}
/**
 * Main module that play-dl uses for proxy.
 * @param req_url URL to make https request to
 * @param req_proxy Proxies array
 * @returns Object with statusCode, head and body
 */
async function proxy_getter(req_url: string, req_proxy: Proxy[]): Promise<ProxyOutput> {
    return new Promise((resolve, reject) => {
        const proxy: string | ProxyOpts = req_proxy[randomIntFromInterval(0, req_proxy.length)];
        const parsed_url = new URL(req_url);
        let opts: ProxyOpts;
        if (typeof proxy === 'string') {
            const parsed = new URL(proxy);
            opts = {
                host: parsed.hostname,
                port: Number(parsed.port),
                authentication: {
                    username: parsed.username,
                    password: parsed.password
                }
            };
        } else opts = proxy;
        let req: ClientRequest;
        if (opts.authentication?.username.length === 0) {
            req = http.request({
                host: opts.host,
                port: opts.port,
                method: 'CONNECT',
                path: `${parsed_url.host}:443`
            });
        } else {
            req = http.request({
                host: opts.host,
                port: opts.port,
                method: 'CONNECT',
                path: `${parsed_url.host}:443`,
                headers: {
                    'Proxy-Authorization': `Basic ${Buffer.from(
                        `${opts.authentication?.username}:${opts.authentication?.password}`
                    ).toString('base64')}`
                }
            });
        }

        req.on('connect', function (res, socket, head) {
            console.log('Connected');
            const tlsConnection = tls.connect(
                {
                    host: parsed_url.hostname,
                    port: 443,
                    socket: socket,
                    rejectUnauthorized: false
                },
                function () {
                    tlsConnection.write(
                        `GET ${parsed_url.pathname}${parsed_url.search} HTTP/1.1\r\n` +
                            `Host : ${parsed_url.hostname}\r\n` +
                            'Connection: close\r\n' +
                            '\r\n'
                    );
                }
            );

            tlsConnection.setEncoding('utf-8');
            let data = '';
            tlsConnection.once('error', (e) => reject(e));
            tlsConnection.on('data', (c) => (data += c));
            tlsConnection.on('end', () => {
                const y = data.split('\r\n\r\n');
                const head = y.shift() as string;
                resolve({
                    statusCode: Number(head.split('\n')[0].split(' ')[1]),
                    head: head,
                    body: y.join('\n')
                });
            });
        });
        req.on('error', (e: Error) => reject(e));
        req.end();
    });
}
/**
 * Main module which play-dl uses to make a proxy or normal request
 * @param url URL to make https request to
 * @param options Request options for https request
 * @returns body of that request
 */
export async function request(url: string, options?: RequestOpts): Promise<string> {
    return new Promise(async (resolve, reject) => {
        if (!options?.proxies) {
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
        } else {
            let res = await proxy_getter(url, options.proxies).catch((e: Error) => e);
            if (res instanceof Error) {
                reject(res);
                return;
            }
            if (res.statusCode >= 300 && res.statusCode < 400) {
                res = await proxy_getter(res.head.split('Location: ')[1].split('\n')[0], options.proxies);
            } else if (res.statusCode > 400) {
                reject(new Error(`GOT ${res.statusCode} from proxy request`));
            }
            resolve(res.body);
        }
    });
}
/**
 * Main module which play-dl uses to make a request to stream url.
 * @param url URL to make https request to
 * @param options Request options for https request
 * @returns IncomingMessage from the request
 */
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
