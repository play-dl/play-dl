import tls, { TLSSocket } from 'tls';
import { URL } from 'url';

interface ProxyOptions extends tls.ConnectionOptions {
    method: 'GET';
    headers?: Object;
}

export class Proxy {
    parsed_url: URL;
    statusCode: number;
    rawHeaders: string;
    headers: Object;
    body: string;
    socket: TLSSocket;
    sentHeaders: string;
    private options: ProxyOptions;
    constructor(parsed_url: URL, options: ProxyOptions) {
        this.parsed_url = parsed_url;
        this.sentHeaders = '';
        this.statusCode = 0;
        this.rawHeaders = '';
        this.body = '';
        this.headers = {};
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
    }

    private onConnect() {
        this.socket.write(
            `${this.options.method} ${this.parsed_url.pathname}${this.parsed_url.search} HTTP/1.1\r\n` +
                `Host: ${this.parsed_url.hostname}\r\n` +
                this.sentHeaders +
                `Connection: close\r\n` +
                `\r\n`
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

    fetch(): Promise<Proxy> {
        return new Promise((resolve, reject) => {
            this.socket.setEncoding('utf-8');
            this.socket.once('error', (err) => reject(err));
            const parts: string[] = [];
            this.socket.on('data', (chunk: string) => {
                if (this.rawHeaders.length === 0) {
                    this.rawHeaders = chunk;
                    this.parseHeaders();
                } else {
                    const arr = chunk.split('\r\n');
                    if (arr.length > 1 && arr[0].length < 5) arr.shift();
                    parts.push(...arr);
                }
            });
            this.socket.on('end', () => {
                this.body = parts.join('');
                resolve(this);
            });
        });
    }
}
