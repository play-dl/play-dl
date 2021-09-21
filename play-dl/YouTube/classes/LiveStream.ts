import { PassThrough } from 'stream';
import { IncomingMessage } from 'http';
import { StreamType } from '../stream';
import { request, request_stream } from '../utils/request';
import { video_info } from '..';

export interface FormatInterface {
    url: string;
    targetDurationSec: number;
    maxDvrDurationSec: number;
}

export class LiveStreaming extends PassThrough {
    type: StreamType;
    private base_url: string;
    private url: string;
    private interval: number;
    private packet_count: number;
    private timer: NodeJS.Timer | null;
    private video_url: string;
    private dash_timer: NodeJS.Timer | null;
    private segments_urls: string[];
    private request: IncomingMessage | null;
    constructor(dash_url: string, target_interval: number, video_url: string) {
        super({ highWaterMark: 10 * 1000 * 1000 });
        this.type = StreamType.Arbitrary;
        this.url = dash_url;
        this.base_url = '';
        this.segments_urls = [];
        this.packet_count = 0;
        this.request = null;
        this.timer = null;
        this.video_url = video_url;
        this.interval = target_interval * 1000 || 0;
        this.dash_timer = setTimeout(() => {
            this.dash_updater();
        }, 1800000);
        this.on('close', () => {
            this.cleanup();
        });
        this.start();
    }

    private async dash_updater() {
        const info = await video_info(this.video_url);
        if (
            info.LiveStreamData.isLive === true &&
            info.LiveStreamData.hlsManifestUrl !== null &&
            info.video_details.durationInSec === '0'
        ) {
            this.url = info.LiveStreamData.dashManifestUrl;
        }
        this.dash_timer = setTimeout(() => {
            this.dash_updater();
        }, 1800000);
    }

    private async dash_getter() {
        const response = await request(this.url);
        const audioFormat = response
            .split('<AdaptationSet id="0"')[1]
            .split('</AdaptationSet>')[0]
            .split('</Representation>');
        if (audioFormat[audioFormat.length - 1] === '') audioFormat.pop();
        this.base_url = audioFormat[audioFormat.length - 1].split('<BaseURL>')[1].split('</BaseURL>')[0];
        const list = audioFormat[audioFormat.length - 1].split('<SegmentList>')[1].split('</SegmentList>')[0];
        this.segments_urls = list.replace(new RegExp('<SegmentURL media="', 'g'), '').split('"/>');
        if (this.segments_urls[this.segments_urls.length - 1] === '') this.segments_urls.pop();
    }

    private cleanup() {
        clearTimeout(this.timer as NodeJS.Timer);
        clearTimeout(this.dash_timer as NodeJS.Timer);
        this.request?.unpipe(this);
        this.request?.destroy();
        this.dash_timer = null;
        this.video_url = '';
        this.request = null;
        this.timer = null;
        this.url = '';
        this.base_url = '';
        this.segments_urls = [];
        this.packet_count = 0;
        this.interval = 0;
    }

    private async start() {
        if (this.destroyed) {
            this.cleanup();
            return;
        }
        await this.dash_getter();
        if (this.segments_urls.length > 3) this.segments_urls.splice(0, this.segments_urls.length - 3);
        if (this.packet_count === 0) this.packet_count = Number(this.segments_urls[0].split('sq/')[1].split('/')[0]);
        for await (const segment of this.segments_urls) {
            if (Number(segment.split('sq/')[1].split('/')[0]) !== this.packet_count) {
                continue;
            }
            await new Promise(async (resolve, reject) => {
                const stream = await request_stream(this.base_url + segment).catch((err: Error) => err);
                if (stream instanceof Error) {
                    this.emit('error', stream);
                    return;
                }
                this.request = stream;
                stream.pipe(this, { end: false });
                stream.on('end', () => {
                    this.packet_count++;
                    resolve('');
                });
                stream.once('error', (err) => {
                    this.emit('error', err);
                });
            });
        }
        this.timer = setTimeout(() => {
            this.start();
        }, this.interval);
    }
}

export class Stream extends PassThrough {
    type: StreamType;
    private url: string;
    private bytes_count: number;
    private per_sec_bytes: number;
    private content_length: number;
    private video_url: string;
    private timer: NodeJS.Timer | null;
    private cookie: string;
    private data_ended: boolean;
    private playing_count: number;
    private request: IncomingMessage | null;
    constructor(
        url: string,
        type: StreamType,
        duration: number,
        contentLength: number,
        video_url: string,
        cookie: string
    ) {
        super({ highWaterMark: 10 * 1000 * 1000 });
        this.url = url;
        this.type = type;
        this.bytes_count = 0;
        this.video_url = video_url;
        this.cookie = cookie;
        this.timer = setInterval(() => {
            this.retry();
        }, 7200 * 1000);
        this.per_sec_bytes = Math.ceil(contentLength / duration);
        this.content_length = contentLength;
        this.request = null;
        this.data_ended = false;
        this.playing_count = 0;
        this.on('close', () => {
            this.cleanup();
        });
        this.on('pause', () => {
            this.playing_count++;
            if (this.data_ended) {
                this.bytes_count = 0;
                this.per_sec_bytes = 0;
                this.cleanup();
                this.removeAllListeners('pause');
            } else if (this.playing_count === 280) {
                this.playing_count = 0;
                this.loop();
            }
        });
        this.loop();
    }

    private async retry() {
        const info = await video_info(this.video_url, this.cookie);
        this.url = info.format[info.format.length - 1].url;
    }

    private cleanup() {
        clearInterval(this.timer as NodeJS.Timer);
        this.request?.unpipe(this);
        this.request?.destroy();
        this.timer = null;
        this.request = null;
        this.url = '';
    }

    private async loop() {
        if (this.destroyed) {
            this.cleanup();
            return;
        }
        const end: number = this.bytes_count + this.per_sec_bytes * 300;
        const stream = await request_stream(this.url, {
            headers: {
                range: `bytes=${this.bytes_count}-${end >= this.content_length ? '' : end}`
            }
        }).catch((err: Error) => err);
        if (stream instanceof Error) {
            this.emit('error', stream);
            this.data_ended = true;
            this.bytes_count = 0;
            this.per_sec_bytes = 0;
            this.cleanup();
            return;
        }
        if (Number(stream.statusCode) >= 400) {
            this.cleanup();
            await this.retry();
            this.loop();
            if (!this.timer) {
                this.timer = setInterval(() => {
                    this.retry();
                }, 7200 * 1000);
            }
            return;
        }
        this.request = stream;
        stream.pipe(this, { end: false });

        stream.once('error', (err) => {
            this.emit('error', err);
        });

        stream.on('data', (chunk: any) => {
            this.bytes_count += chunk.length;
        });

        stream.on('end', () => {
            if (end >= this.content_length) this.data_ended = true;
        });
    }
}
