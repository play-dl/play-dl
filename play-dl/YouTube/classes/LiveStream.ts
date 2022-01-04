import { Readable } from 'node:stream';
import { IncomingMessage } from 'node:http';
import { parseAudioFormats, StreamOptions, StreamType } from '../stream';
import { request, request_stream } from '../../Request';
import { video_stream_info } from '../utils/extractor';
import { URL } from 'node:url';

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
     * Incoming message that we recieve.
     *
     * Storing this is essential.
     * This helps to destroy the TCP connection completely if you stopped player in between the stream
     */
    private request?: IncomingMessage;
    /**
     * Timer that creates loop from interval time provided.
     */
    private normal_timer?: Timer;
    /**
     * Timer used to update dash url so as to avoid 404 errors after long hours of streaming.
     *
     * It updates dash_url every 30 minutes.
     */
    private dash_timer: Timer;
    /**
     * Given Dash URL.
     */
    private dash_url: string;
    /**
     * Base URL in dash manifest file.
     */
    private base_url: string;
    /**
     * Interval to fetch data again to dash url.
     */
    private interval: number;
    /**
     * Timer used to update dash url so as to avoid 404 errors after long hours of streaming.
     *
     * It updates dash_url every 30 minutes.
     */
    private video_url: string;
    /**
     * No of segments of data to add in stream before starting to loop
     */
    private precache: number;
    /**
     * Segment sequence number
     */
    private sequence: number;
    /**
     * Live Stream Class Constructor
     * @param dash_url dash manifest URL
     * @param target_interval interval time for fetching dash data again
     * @param video_url Live Stream video url.
     */
    constructor(dash_url: string, interval: number, video_url: string, precache?: number) {
        this.stream = new Readable({ highWaterMark: 5 * 1000 * 1000, read() {} });
        this.type = StreamType.Arbitrary;
        this.sequence = 0;
        this.dash_url = dash_url;
        this.base_url = '';
        this.interval = interval;
        this.video_url = video_url;
        this.precache = precache || 3;
        this.dash_timer = new Timer(() => {
            this.dash_updater();
            this.dash_timer.reuse();
        }, 1800);
        this.stream.on('close', () => {
            this.cleanup();
        });
        this.initialize_dash();
    }
    /**
     * This cleans every used variable in class.
     *
     * This is used to prevent re-use of this class and helping garbage collector to collect it.
     */
    private cleanup() {
        this.normal_timer?.destroy();
        this.dash_timer.destroy();
        this.request?.destroy();
        this.video_url = '';
        this.request = undefined;
        this.dash_url = '';
        this.base_url = '';
        this.interval = 0;
    }
    /**
     * Updates dash url.
     *
     * Used by dash_timer for updating dash_url every 30 minutes.
     */
    private async dash_updater() {
        const info = await video_stream_info(this.video_url);
        if (info.LiveStreamData.dashManifestUrl) this.dash_url = info.LiveStreamData.dashManifestUrl;
        return this.initialize_dash();
    }
    /**
     * Initializes dash after getting dash url.
     *
     * Start if it is first time of initialishing dash function.
     */
    private async initialize_dash() {
        const response = await request(this.dash_url);
        const audioFormat = response
            .split('<AdaptationSet id="0"')[1]
            .split('</AdaptationSet>')[0]
            .split('</Representation>');
        if (audioFormat[audioFormat.length - 1] === '') audioFormat.pop();
        this.base_url = audioFormat[audioFormat.length - 1].split('<BaseURL>')[1].split('</BaseURL>')[0];
        await request_stream(`https://${new URL(this.base_url).host}/generate_204`);
        if (this.sequence === 0) {
            const list = audioFormat[audioFormat.length - 1]
                .split('<SegmentList>')[1]
                .split('</SegmentList>')[0]
                .replaceAll('<SegmentURL media="', '')
                .split('"/>');
            if (list[list.length - 1] === '') list.pop();
            if (list.length > this.precache) list.splice(0, list.length - this.precache);
            this.sequence = Number(list[0].split('sq/')[1].split('/')[0]);
            this.first_data(list.length);
        }
    }
    /**
     * Used only after initializing dash function first time.
     * @param len Length of data that you want to
     */
    private async first_data(len: number) {
        for (let i = 1; i <= len; i++) {
            await new Promise(async (resolve) => {
                const stream = await request_stream(this.base_url + 'sq/' + this.sequence).catch((err: Error) => err);
                if (stream instanceof Error) {
                    this.stream.emit('error', stream);
                    return;
                }
                this.request = stream;
                stream.on('data', (c) => {
                    this.stream.push(c);
                });
                stream.on('end', () => {
                    this.sequence++;
                    resolve('');
                });
                stream.once('error', (err) => {
                    this.stream.emit('error', err);
                });
            });
        }
        this.normal_timer = new Timer(() => {
            this.loop();
            this.normal_timer?.reuse();
        }, this.interval);
    }
    /**
     * This loops function in Live Stream Class.
     *
     * Gets next segment and push it.
     */
    private loop() {
        return new Promise(async (resolve) => {
            const stream = await request_stream(this.base_url + 'sq/' + this.sequence).catch((err: Error) => err);
            if (stream instanceof Error) {
                this.stream.emit('error', stream);
                return;
            }
            this.request = stream;
            stream.on('data', (c) => {
                this.stream.push(c);
            });
            stream.on('end', () => {
                this.sequence++;
                resolve('');
            });
            stream.once('error', (err) => {
                this.stream.emit('error', err);
            });
        });
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
