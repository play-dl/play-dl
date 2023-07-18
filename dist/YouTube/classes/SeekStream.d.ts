import { StreamOptions, StreamType } from '../stream';
import { WebmSeeker } from './WebmSeeker';
/**
 * YouTube Stream Class for seeking audio to a timeStamp.
 */
export declare class SeekStream {
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
    private url;
    /**
     * Used to calculate no of bytes data that we have recieved
     */
    private bytes_count;
    /**
     * Calculate per second bytes by using contentLength (Total bytes) / Duration (in seconds)
     */
    private per_sec_bytes;
    /**
     * Length of the header in bytes
     */
    private header_length;
    /**
     * Total length of audio file in bytes
     */
    private content_length;
    /**
     * YouTube video url. [ Used only for retrying purposes only. ]
     */
    private video_url;
    /**
     * Timer for looping data every 265 seconds.
     */
    private timer;
    /**
     * Quality given by user. [ Used only for retrying purposes only. ]
     */
    private quality;
    /**
     * Incoming message that we recieve.
     *
     * Storing this is essential.
     * This helps to destroy the TCP connection completely if you stopped player in between the stream
     */
    private request;
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
    constructor(url: string, duration: number, headerLength: number, contentLength: number, bitrate: number, video_url: string, options: StreamOptions);
    /**
     * **INTERNAL Function**
     *
     * Uses stream functions to parse Webm Head and gets Offset byte to seek to.
     * @returns Nothing
     */
    private seek;
    /**
     * Retry if we get 404 or 403 Errors.
     */
    private retry;
    /**
     * This cleans every used variable in class.
     *
     * This is used to prevent re-use of this class and helping garbage collector to collect it.
     */
    private cleanup;
    /**
     * Getting data from audio endpoint url and passing it to stream.
     *
     * If 404 or 403 occurs, it will retry again.
     */
    private loop;
    /**
     * Pauses timer.
     * Stops running of loop.
     *
     * Useful if you don't want to get excess data to be stored in stream.
     */
    pause(): void;
    /**
     * Resumes timer.
     * Starts running of loop.
     */
    resume(): void;
}
//# sourceMappingURL=SeekStream.d.ts.map