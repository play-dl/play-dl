"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = exports.Stream = exports.LiveStream = void 0;
const node_stream_1 = require("node:stream");
const stream_1 = require("../stream");
const Request_1 = require("../../Request");
const extractor_1 = require("../utils/extractor");
const node_url_1 = require("node:url");
/**
 * YouTube Live Stream class for playing audio from Live Stream videos.
 */
class LiveStream {
    /**
     * Live Stream Class Constructor
     * @param dash_url dash manifest URL
     * @param target_interval interval time for fetching dash data again
     * @param video_url Live Stream video url.
     */
    constructor(dash_url, interval, video_url, precache) {
        this.stream = new node_stream_1.Readable({ highWaterMark: 5 * 1000 * 1000, read() { } });
        this.type = stream_1.StreamType.Arbitrary;
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
    cleanup() {
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
    async dash_updater() {
        const info = await (0, extractor_1.video_stream_info)(this.video_url);
        if (info.LiveStreamData.dashManifestUrl)
            this.dash_url = info.LiveStreamData.dashManifestUrl;
        return this.initialize_dash();
    }
    /**
     * Initializes dash after getting dash url.
     *
     * Start if it is first time of initialishing dash function.
     */
    async initialize_dash() {
        const response = await (0, Request_1.request)(this.dash_url);
        const audioFormat = response
            .split('<AdaptationSet id="0"')[1]
            .split('</AdaptationSet>')[0]
            .split('</Representation>');
        if (audioFormat[audioFormat.length - 1] === '')
            audioFormat.pop();
        this.base_url = audioFormat[audioFormat.length - 1].split('<BaseURL>')[1].split('</BaseURL>')[0];
        await (0, Request_1.request_stream)(`https://${new node_url_1.URL(this.base_url).host}/generate_204`);
        if (this.sequence === 0) {
            const list = audioFormat[audioFormat.length - 1]
                .split('<SegmentList>')[1]
                .split('</SegmentList>')[0]
                .replaceAll('<SegmentURL media="', '')
                .split('"/>');
            if (list[list.length - 1] === '')
                list.pop();
            if (list.length > this.precache)
                list.splice(0, list.length - this.precache);
            this.sequence = Number(list[0].split('sq/')[1].split('/')[0]);
            this.first_data(list.length);
        }
    }
    /**
     * Used only after initializing dash function first time.
     * @param len Length of data that you want to
     */
    async first_data(len) {
        for (let i = 1; i <= len; i++) {
            await new Promise(async (resolve) => {
                const stream = await (0, Request_1.request_stream)(this.base_url + 'sq/' + this.sequence).catch((err) => err);
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
    loop() {
        return new Promise(async (resolve) => {
            const stream = await (0, Request_1.request_stream)(this.base_url + 'sq/' + this.sequence).catch((err) => err);
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
    pause() { }
    /**
     * Deprecated Functions
     */
    resume() { }
}
exports.LiveStream = LiveStream;
/**
 * YouTube Stream Class for playing audio from normal videos.
 */
class Stream {
    /**
     * YouTube Stream Class constructor
     * @param url Audio Endpoint url.
     * @param type Type of Stream
     * @param duration Duration of audio playback [ in seconds ]
     * @param contentLength Total length of Audio file in bytes.
     * @param video_url YouTube video url.
     * @param options Options provided to stream function.
     */
    constructor(url, type, duration, contentLength, video_url, options) {
        this.stream = new node_stream_1.Readable({ highWaterMark: 5 * 1000 * 1000, read() { } });
        this.url = url;
        this.quality = options.quality;
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
    async retry() {
        const info = await (0, extractor_1.video_stream_info)(this.video_url);
        const audioFormat = (0, stream_1.parseAudioFormats)(info.format);
        this.url = audioFormat[this.quality].url;
    }
    /**
     * This cleans every used variable in class.
     *
     * This is used to prevent re-use of this class and helping garbage collector to collect it.
     */
    cleanup() {
        this.request?.destroy();
        this.request = null;
        this.url = '';
    }
    /**
     * Getting data from audio endpoint url and passing it to stream.
     *
     * If 404 or 403 occurs, it will retry again.
     */
    async loop() {
        if (this.stream.destroyed) {
            this.timer.destroy();
            this.cleanup();
            return;
        }
        const end = this.bytes_count + this.per_sec_bytes * 300;
        const stream = await (0, Request_1.request_stream)(this.url, {
            headers: {
                range: `bytes=${this.bytes_count}-${end >= this.content_length ? '' : end}`
            }
        }).catch((err) => err);
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
        stream.on('data', (chunk) => {
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
exports.Stream = Stream;
/**
 * Timer Class.
 *
 * setTimeout + extra features ( re-starting, pausing, resuming ).
 */
class Timer {
    /**
     * Constructor for Timer Class
     * @param callback Function to execute when timer is up.
     * @param time Total time to wait before execution.
     */
    constructor(callback, time) {
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
        }
        else
            return false;
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
        }
        else
            return false;
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
        }
        else
            return false;
    }
    /**
     * Destroy timer.
     *
     * It can't be used again.
     */
    destroy() {
        clearTimeout(this.timer);
        this.destroyed = true;
        this.callback = () => { };
        this.time_total = 0;
        this.time_left = 0;
        this.paused = false;
        this.time_start = 0;
    }
}
exports.Timer = Timer;
//# sourceMappingURL=LiveStream.js.map