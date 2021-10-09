import tls, { TLSSocket } from 'tls';
import { URL } from 'url';
import { Timer } from '../YouTube/classes/LiveStream';

interface ResponseOptions extends tls.ConnectionOptions {
    body?: string;
    method: 'GET' | 'POST';
    cookies?: boolean;
    headers?: Object;
    timeout?: number;
}

export class Response {
    parsed_url: URL;
    statusCode: number;
    rawHeaders: string;
    headers: Object;
    body: string;
    socket: TLSSocket;
    sentHeaders: string;
    sentBody: string;
    private options: ResponseOptions;
    private timer: Timer | null;
    constructor(req_url: string, options: ResponseOptions) {
        this.parsed_url = new URL(req_url);
        this.sentHeaders = '';
        this.statusCode = 0;
        this.sentBody = '';
        this.rawHeaders = '';
        this.body = '';
        this.headers = {};
        this.timer = null;
        this.options = options;
        this.socket = tls.connect(
            {
                host: this.parsed_url.hostname,
                port: Number(this.parsed_url.port) || 443,
                socket: options.socket,
                rejectUnauthorized: false
            },
            () => this.onConnect()
        );
        if (options.headers) {
            for (const [key, value] of Object.entries(options.headers)) {
                this.sentHeaders += `${key}: ${value}\r\n`;
            }
        }
        if (options.body) this.sentBody = options.body;
    }

    private onConnect() {
        this.socket.write(
            `${this.options.method} ${this.parsed_url.pathname}${this.parsed_url.search} HTTP/1.1\r\n` +
                `Host : ${this.parsed_url.hostname}\r\n` +
                this.sentHeaders +
                `Connection: close\r\n` +
                `\r\n` +
                this.sentBody
        );
    }

    private parseHeaders() {
        const head_arr = this.rawHeaders.split('\r\n');
        this.statusCode = Number(head_arr.shift()?.split(' ')[1]) ?? -1;
        for (const head of head_arr) {
            let [key, value] = head.split(': ');
            if (!value) break;
            key = key.trim().toLowerCase();
            value = value.trim();
            if (Object.keys(this.headers).includes(key)) {
                let val = (this.headers as any)[key];
                if (typeof val === 'string') val = [val];
                Object.assign(this.headers, { [key]: [...val, value] });
            } else Object.assign(this.headers, { [key]: value });
        }
    }

    stream(): Promise<TLSSocket> {
        return new Promise((resolve, reject) => {
            this.timer = new Timer(() => this.socket.end(), this.options.timeout || 1);
            this.socket.once('error', (err) => reject(err));
            this.socket.once('data', (chunk) => {
                this.rawHeaders = chunk.toString('utf-8');
                this.parseHeaders();
                resolve(this.socket);
            });
            this.socket.on('data', () => this.timer?.reuse());
            this.socket.once('end', () => this.timer?.destroy());
        });
    }

    fetch(): Promise<Response> {
        return new Promise((resolve, reject) => {
            this.socket.setEncoding('utf-8');
            this.socket.once('error', (err) => reject(err));
            this.socket.on('data', (chunk: string) => {
                if (this.rawHeaders.length === 0) {
                    this.rawHeaders = chunk;
                    this.parseHeaders();
                } else {
                    const arr = chunk.split('\r\n');
                    if (arr.length > 1 && arr[0].length < 5) arr.shift();
                    this.body += arr.join('');
                }
            });
            this.socket.on('end', () => {
                resolve(this);
            });
        });
    }
}
