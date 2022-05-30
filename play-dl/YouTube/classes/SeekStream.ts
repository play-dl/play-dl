import { IncomingMessage } from 'node:http';
import { request_stream } from '../../Request';
import { parseAudioFormats, StreamOptions, StreamType } from '../stream';
import { video_stream_info } from '../utils/extractor';
import { Timer } from './LiveStream';
import { WebmSeeker, WebmSeekerState } from './WebmSeeker';

/**
 * YouTube Stream Class for seeking audio to a timeStamp.
 */
export class SeekStream {
    /**
     * WebmSeeker Stream through which data passes
     */
    stream: WebmSeeker;
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
     * Length of the header in bytes
     */
    private header_length: number;
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
     * @param headerLength Length of the header in bytes.
     * @param contentLength Total length of Audio file in bytes.
     * @param bitrate Bitrate provided by YouTube.
     * @param video_url YouTube video url.
     * @param options Options provided to stream function.
     */
    constructor(
        url: string,
        duration: number,
        headerLength: number,
        contentLength: number,
        bitrate: number,
        video_url: string,
        options: StreamOptions
    ) {
        this.stream = new WebmSeeker(options.seek!, {
            highWaterMark: 5 * 1000 * 1000,
            readableObjectMode: true
        });
        this.url = url;
        this.quality = options.quality as number;
        this.type = StreamType.Opus;
        this.bytes_count = 0;
        this.video_url = video_url;
        this.per_sec_bytes = bitrate ? Math.ceil(bitrate / 8) : Math.ceil(contentLength / duration);
        this.header_length = headerLength;
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
        this.seek();
    }
    /**
     * **INTERNAL Function**
     *
     * Uses stream functions to parse Webm Head and gets Offset byte to seek to.
     * @returns Nothing
     */
    private async seek(): Promise<void> {
        const parse = await new Promise(async (res, rej) => {
            if (!this.stream.headerparsed) {
                const stream = await request_stream(this.url, {
                    headers: {
                        range: `bytes=0-${this.header_length}`
                    }
                }).catch((err: Error) => err);

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
                    this.stream.state = WebmSeekerState.READING_DATA;
                    res('');
                });

                this.stream.once('headComplete', () => {
                    stream.unpipe(this.stream);
                    stream.destroy();
                    this.stream.state = WebmSeekerState.READING_DATA;
                    res('');
                });
            } else res('');
        }).catch((err) => err);
        if (parse instanceof Error) {
            this.stream.emit('error', parse);
            this.bytes_count = 0;
            this.per_sec_bytes = 0;
            this.cleanup();
            return;
        } else if (parse === 400) {
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
        stream.pipe(this.stream, { end: false });

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
