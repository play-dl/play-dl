"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeekStream = void 0;
const Request_1 = require("../../Request");
const stream_1 = require("../stream");
const extractor_1 = require("../utils/extractor");
const LiveStream_1 = require("./LiveStream");
const WebmSeeker_1 = require("./WebmSeeker");
/**
 * YouTube Stream Class for seeking audio to a timeStamp.
 */
class SeekStream {
    /**
     * YouTube Stream Class constructor
     * @param url Audio Endpoint url.
     * @param type Type of Stream
     * @param duration Duration of audio playback [ in seconds ]
     * @param headerLength Length of the header in bytes.
     * @param contentLength Total length of Audio file in bytes.
     * @param bitrate Bitrate provided by YouTube.
     * @param video_url YouTube video url.
     * @param options Options provided to stream function.
     */
    constructor(url, duration, headerLength, contentLength, bitrate, video_url, options) {
        this.stream = new WebmSeeker_1.WebmSeeker(options.seek, {
            highWaterMark: 5 * 1000 * 1000,
            readableObjectMode: true
        });
        this.url = url;
        this.quality = options.quality;
        this.type = stream_1.StreamType.Opus;
        this.bytes_count = 0;
        this.video_url = video_url;
        this.per_sec_bytes = bitrate ? Math.ceil(bitrate / 8) : Math.ceil(contentLength / duration);
        this.header_length = headerLength;
        this.content_length = contentLength;
        this.request = null;
        this.timer = new LiveStream_1.Timer(() => {
            this.timer.reuse();
            this.loop();
        }, 265);
        this.stream.on('close', () => {
            this.timer.destroy();
            this.cleanup();
        });
        this.seek();
    }
    /**
     * **INTERNAL Function**
     *
     * Uses stream functions to parse Webm Head and gets Offset byte to seek to.
     * @returns Nothing
     */
    async seek() {
        const parse = await new Promise(async (res, rej) => {
            if (!this.stream.headerparsed) {
                const stream = await (0, Request_1.request_stream)(this.url, {
                    headers: {
                        range: `bytes=0-${this.header_length}`
                    }
                }).catch((err) => err);
                if (stream instanceof Error) {
                    rej(stream);
                    return;
                }
                if (Number(stream.statusCode) >= 400) {
                    rej(400);
                    return;
                }
                this.request = stream;
                stream.pipe(this.stream, { end: false });
                // headComplete should always be called, leaving this here just in case
                stream.once('end', () => {
                    this.stream.state = WebmSeeker_1.WebmSeekerState.READING_DATA;
                    res('');
                });
                this.stream.once('headComplete', () => {
                    stream.unpipe(this.stream);
                    stream.destroy();
                    this.stream.state = WebmSeeker_1.WebmSeekerState.READING_DATA;
                    res('');
                });
            }
            else
                res('');
        }).catch((err) => err);
        if (parse instanceof Error) {
            this.stream.emit('error', parse);
            this.bytes_count = 0;
            this.per_sec_bytes = 0;
            this.cleanup();
            return;
        }
        else if (parse === 400) {
            await this.retry();
            this.timer.reuse();
            return this.seek();
        }
        const bytes = this.stream.seek(this.content_length);
        if (bytes instanceof Error) {
            this.stream.emit('error', bytes);
            this.bytes_count = 0;
            this.per_sec_bytes = 0;
            this.cleanup();
            return;
        }
        this.stream.seekfound = false;
        this.bytes_count = bytes;
        this.timer.reuse();
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
        stream.pipe(this.stream, { end: false });
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
                this.stream.end();
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
exports.SeekStream = SeekStream;
//# sourceMappingURL=SeekStream.js.map