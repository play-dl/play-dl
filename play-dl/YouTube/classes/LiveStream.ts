import { PassThrough } from 'stream';
import { IncomingMessage } from 'http';
import { parseAudioFormats, StreamOptions, StreamType } from '../stream';
import { Proxy, request, request_stream } from '../utils/request';
import { video_info } from '..';

export interface FormatInterface {
    url: string;
    targetDurationSec: number;
    maxDvrDurationSec: number;
}

export class LiveStreaming {
    stream: PassThrough;
    type: StreamType;
    private base_url: string;
    private url: string;
    private interval: number;
    private packet_count: number;
    private timer: Timer;
    private video_url: string;
    private dash_timer: Timer;
    private segments_urls: string[];
    private request: IncomingMessage | null;
    constructor(dash_url: string, target_interval: number, video_url: string) {
        this.stream = new PassThrough({ highWaterMark: 10 * 1000 * 1000 });
        this.type = StreamType.Arbitrary;
        this.url = dash_url;
        this.base_url = '';
        this.segments_urls = [];
        this.packet_count = 0;
        this.request = null;
        this.video_url = video_url;
        this.interval = target_interval || 0;
        this.timer = new Timer(() => {
            this.start();
        }, this.interval);
        this.dash_timer = new Timer(() => {
            this.dash_timer.reuse();
            this.dash_updater();
        }, 1800);
        this.stream.on('close', () => {
            this.cleanup();
        });
        this.start();
    }

    private async dash_updater() {
        const info = await video_info(this.video_url);
        if (
            info.LiveStreamData.isLive === true &&
            info.LiveStreamData.hlsManifestUrl !== null &&
            info.video_details.durationInSec === 0
        ) {
            this.url = info.LiveStreamData.dashManifestUrl;
        }
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
        this.timer.destroy();
        this.dash_timer.destroy();
        this.request?.unpipe(this.stream);
        this.request?.destroy();
        this.video_url = '';
        this.request = null;
        this.url = '';
        this.base_url = '';
        this.segments_urls = [];
        this.packet_count = 0;
        this.interval = 0;
    }

    private async start() {
        if (this.stream.destroyed) {
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
                    this.stream.emit('error', stream);
                    return;
                }
                this.request = stream;
                stream.pipe(this.stream, { end: false });
                stream.on('end', () => {
                    this.packet_count++;
                    resolve('');
                });
                stream.once('error', (err) => {
                    this.stream.emit('error', err);
                });
            });
        }
        
        this.timer.reuse();
    }

    pause() {}
    resume() {}
}
/**
 * Class for YouTube Stream
 */
export class Stream {
    stream: PassThrough;
    type: StreamType;
    private url: string;
    private bytes_count: number;
    private per_sec_bytes: number;
    private content_length: number;
    private video_url: string;
    private timer: Timer;
    private quality: number;
    private proxy: Proxy[] | undefined;
    private request: IncomingMessage | null;
    constructor(
        url: string,
        type: StreamType,
        duration: number,
        contentLength: number,
        video_url: string,
        options: StreamOptions
    ) {
        this.stream = new PassThrough({ highWaterMark: 10 * 1000 * 1000 });
        this.url = url;
        this.quality = options.quality as number;
        this.proxy = options.proxy || undefined;
        this.type = type;
        this.bytes_count = 0;
        this.video_url = video_url;
        this.per_sec_bytes = Math.ceil(contentLength / duration);
        this.content_length = contentLength;
        this.request = null;
        this.timer = new Timer(() => {
            this.timer.reuse();
            this.loop();
        }, 265);
        this.stream.on('close', () => {
            this.cleanup();
        });
        this.loop();
    }

    private async retry() {
        const info = await video_info(this.video_url, { proxy: this.proxy });
        const audioFormat = parseAudioFormats(info.format);
        this.url = audioFormat[this.quality].url;
    }

    private cleanup() {
        this.request?.unpipe(this.stream);
        this.request?.destroy();
        this.request = null;
        this.url = '';
    }

    private async loop() {
        if (this.stream.destroyed) {
            this.timer.destroy()
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
            this.stream.emit('error', stream);
            this.bytes_count = 0;
            this.per_sec_bytes = 0;
            this.cleanup();
            return;
        }
        if (Number(stream.statusCode) >= 400) {
            this.cleanup();
            await this.retry();
            this.loop();
            return;
        }
        this.request = stream;
        stream.pipe(this.stream, { end: false });

        stream.once('error', async (err) => {
            this.cleanup();
            await this.retry();
            this.loop();
        });

        stream.on('data', (chunk: any) => {
            this.bytes_count += chunk.length;
        });

        stream.on('end', () => {
            if (end >= this.content_length) {
                this.timer.destroy();
            }
        });
    }

    pause() {
        this.timer.pause();
    }

    resume() {
        this.timer.resume();
    }
}

export class Timer {
    private destroyed: boolean;
    private paused: boolean;
    private timer: NodeJS.Timer;
    private callback: () => void;
    private time_start: number;
    private time_left: number;
    private time_total: number;
    constructor(callback: () => void, time: number) {
        this.callback = callback;
        this.time_total = time;
        this.time_left = time;
        this.paused = false;
        this.destroyed = false;
        this.time_start = process.hrtime()[0];
        this.timer = setTimeout(this.callback, this.time_total * 1000);
    }

    pause() {
        if (!this.paused && !this.destroyed) {
            this.paused = true;
            clearTimeout(this.timer);
            this.time_left = this.time_left - (process.hrtime()[0] - this.time_start);
            return true;
        } else return false;
    }

    resume() {
        if (this.paused && !this.destroyed) {
            this.paused = false;
            this.time_start = process.hrtime()[0];
            this.timer = setTimeout(this.callback, this.time_left * 1000);
            return true;
        } else return false;
    }

    reuse() {
        if (!this.destroyed) {
            clearTimeout(this.timer);
            this.time_left = this.time_total;
            this.paused = false;
            this.time_start = process.hrtime()[0];
            this.timer = setTimeout(this.callback, this.time_total * 1000);
            return true;
        } else return false;
    }

    destroy() {
        clearTimeout(this.timer);
        this.destroyed = true;
        this.callback = () => {};
        this.time_total = 0;
        this.time_left = 0;
        this.paused = false;
        this.time_start = 0;
    }
}
