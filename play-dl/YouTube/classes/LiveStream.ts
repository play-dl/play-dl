import { Readable } from 'node:stream';
import { IncomingMessage } from 'node:http';
import { parseAudioFormats, StreamOptions, StreamType } from '../stream';
import { request, request_stream } from '../../Request';
import { video_stream_info } from '../utils/extractor';

export interface FormatInterface {
    url: string;
    targetDurationSec: number;
    maxDvrDurationSec: number;
}
/**
 * YouTube Live Stream class for playing audio from Live Stream videos.
 */
export class LiveStream {
    /**
     * Readable Stream through which data passes
     */
    stream: Readable;
    /**
     * Type of audio data that we recieved from live stream youtube url.
     */
    type: StreamType;
    /**
     * Base URL in dash manifest file.
     */
    private base_url: string;
    /**
     * Given Dash URL.
     */
    private url: string;
    /**
     * Interval to fetch data again to dash url.
     */
    private interval: number;
    /**
     * Sequence count of urls in dash file.
     */
    private packet_count: number;
    /**
     * Timer that creates loop from interval time provided.
     */
    private timer: Timer;
    /**
     * Live Stream Video url.
     */
    private video_url: string;
    /**
     * Timer used to update dash url so as to avoid 404 errors after long hours of streaming.
     *
     * It updates dash_url every 30 minutes.
     */
    private dash_timer: Timer;
    /**
     * Segments of url that we recieve in dash file.
     *
     * base_url + segment_urls[0] = One complete url for one segment.
     */
    private segments_urls: string[];
    /**
     * Incoming message that we recieve.
     *
     * Storing this is essential.
     * This helps to destroy the TCP connection completely if you stopped player in between the stream
     */
    private request: IncomingMessage | null;
    /**
     * Live Stream Class Constructor
     * @param dash_url dash manifest URL
     * @param target_interval interval time for fetching dash data again
     * @param video_url Live Stream video url.
     */
    constructor(dash_url: string, target_interval: number, video_url: string) {
        this.stream = new Readable({ highWaterMark: 5 * 1000 * 1000, read() {} });
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
    /**
     * Updates dash url.
     *
     * Used by dash_timer for updating dash_url every 30 minutes.
     */
    private async dash_updater() {
        const info = await video_stream_info(this.video_url);
        if (
            info.LiveStreamData.isLive === true &&
            info.LiveStreamData.hlsManifestUrl !== null &&
            info.video_details.durationInSec === 0
        ) {
            this.url = info.LiveStreamData.dashManifestUrl as string;
        }
    }
    /**
     * Parses data recieved from dash_url.
     *
     * Updates base_url , segments_urls array.
     */
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
    /**
     * This cleans every used variable in class.
     *
     * This is used to prevent re-use of this class and helping garbage collector to collect it.
     */
    private cleanup() {
        this.timer.destroy();
        this.dash_timer.destroy();
        this.request?.destroy();
        this.video_url = '';
        this.request = null;
        this.url = '';
        this.base_url = '';
        this.segments_urls = [];
        this.packet_count = 0;
        this.interval = 0;
    }
    /**
     * This starts function in Live Stream Class.
     *
     * Gets data from dash url and pass it to dash getter function.
     * Get data from complete segment url and pass data to Stream.
     */
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
                stream.on('data', (c) => {
                    this.stream.push(c);
                });
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
    /**
     * Deprecated Functions
     */
    pause() {}
    /**
     * Deprecated Functions
     */
    resume() {}
}
/**
 * YouTube Stream Class for playing audio from normal videos.
 */
export class Stream {
    /**
     * Readable Stream through which data passes
     */
    stream: Readable;
    /**
     * Type of audio data that we recieved from normal youtube url.
     */
    type: StreamType;
    /**
     * Audio Endpoint Format Url to get data from.
     */
    private url: string;
    /**
     * Used to calculate no of bytes data that we have recieved
     */
    private bytes_count: number;
    /**
     * Calculate per second bytes by using contentLength (Total bytes) / Duration (in seconds)
     */
    private per_sec_bytes: number;
    /**
     * Total length of audio file in bytes
     */
    private content_length: number;
    /**
     * YouTube video url. [ Used only for retrying purposes only. ]
     */
    private video_url: string;
    /**
     * Timer for looping data every 265 seconds.
     */
    private timer: Timer;
    /**
     * Quality given by user. [ Used only for retrying purposes only. ]
     */
    private quality: number;
    /**
     * Incoming message that we recieve.
     *
     * Storing this is essential.
     * This helps to destroy the TCP connection completely if you stopped player in between the stream
     */
    private request: IncomingMessage | null;
    /**
     * YouTube Stream Class constructor
     * @param url Audio Endpoint url.
     * @param type Type of Stream
     * @param duration Duration of audio playback [ in seconds ]
     * @param contentLength Total length of Audio file in bytes.
     * @param video_url YouTube video url.
     * @param options Options provided to stream function.
     */
    constructor(
        url: string,
        type: StreamType,
        duration: number,
        contentLength: number,
        video_url: string,
        options: StreamOptions
    ) {
        this.stream = new Readable({ highWaterMark: 5 * 1000 * 1000, read() {} });
        this.url = url;
        this.quality = options.quality as number;
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
            this.timer.destroy();
            this.cleanup();
        });
        this.loop();
    }
    /**
     * Retry if we get 404 or 403 Errors.
     */
    private async retry() {
        const info = await video_stream_info(this.video_url);
        const audioFormat = parseAudioFormats(info.format);
        this.url = audioFormat[this.quality].url;
    }
    /**
     * This cleans every used variable in class.
     *
     * This is used to prevent re-use of this class and helping garbage collector to collect it.
     */
    private cleanup() {
        this.request?.destroy();
        this.request = null;
        this.url = '';
    }
    /**
     * Getting data from audio endpoint url and passing it to stream.
     *
     * If 404 or 403 occurs, it will retry again.
     */
    private async loop() {
        if (this.stream.destroyed) {
            this.timer.destroy();
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
            this.timer.reuse();
            this.loop();
            return;
        }
        this.request = stream;
        stream.on('data', (c) => {
            this.stream.push(c);
        });

        stream.once('error', async () => {
            this.cleanup();
            await this.retry();
            this.timer.reuse();
            this.loop();
        });

        stream.on('data', (chunk: any) => {
            this.bytes_count += chunk.length;
        });

        stream.on('end', () => {
            if (end >= this.content_length) {
                this.timer.destroy();
                this.stream.push(null);
                this.cleanup();
            }
        });
    }
    /**
     * Pauses timer.
     * Stops running of loop.
     *
     * Useful if you don't want to get excess data to be stored in stream.
     */
    pause() {
        this.timer.pause();
    }
    /**
     * Resumes timer.
     * Starts running of loop.
     */
    resume() {
        this.timer.resume();
    }
}
/**
 * Timer Class.
 *
 * setTimeout + extra features ( re-starting, pausing, resuming ).
 */
export class Timer {
    /**
     * Boolean for checking if Timer is destroyed or not.
     */
    private destroyed: boolean;
    /**
     * Boolean for checking if Timer is paused or not.
     */
    private paused: boolean;
    /**
     * setTimeout function
     */
    private timer: NodeJS.Timer;
    /**
     * Callback to be executed once timer finishes.
     */
    private callback: () => void;
    /**
     * Seconds time when it is started.
     */
    private time_start: number;
    /**
     * Total time left.
     */
    private time_left: number;
    /**
     * Total time given by user [ Used only for re-using timer. ]
     */
    private time_total: number;
    /**
     * Constructor for Timer Class
     * @param callback Function to execute when timer is up.
     * @param time Total time to wait before execution.
     */
    constructor(callback: () => void, time: number) {
        this.callback = callback;
        this.time_total = time;
        this.time_left = time;
        this.paused = false;
        this.destroyed = false;
        this.time_start = process.hrtime()[0];
        this.timer = setTimeout(this.callback, this.time_total * 1000);
    }
    /**
     * Pauses Timer
     * @returns Boolean to tell that if it is paused or not.
     */
    pause() {
        if (!this.paused && !this.destroyed) {
            this.paused = true;
            clearTimeout(this.timer);
            this.time_left = this.time_left - (process.hrtime()[0] - this.time_start);
            return true;
        } else return false;
    }
    /**
     * Resumes Timer
     * @returns Boolean to tell that if it is resumed or not.
     */
    resume() {
        if (this.paused && !this.destroyed) {
            this.paused = false;
            this.time_start = process.hrtime()[0];
            this.timer = setTimeout(this.callback, this.time_left * 1000);
            return true;
        } else return false;
    }
    /**
     * Reusing of timer
     * @returns Boolean to tell if it is re-used or not.
     */
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
    /**
     * Destroy timer.
     *
     * It can't be used again.
     */
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
