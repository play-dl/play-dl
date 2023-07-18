/// <reference types="node" />
import { Readable } from 'node:stream';
import { StreamOptions, StreamType } from '../stream';
/**
 * YouTube Live Stream class for playing audio from Live Stream videos.
 */
export declare class LiveStream {
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
    private request?;
    /**
     * Timer that creates loop from interval time provided.
     */
    private normal_timer?;
    /**
     * Timer used to update dash url so as to avoid 404 errors after long hours of streaming.
     *
     * It updates dash_url every 30 minutes.
     */
    private dash_timer;
    /**
     * Given Dash URL.
     */
    private dash_url;
    /**
     * Base URL in dash manifest file.
     */
    private base_url;
    /**
     * Interval to fetch data again to dash url.
     */
    private interval;
    /**
     * Timer used to update dash url so as to avoid 404 errors after long hours of streaming.
     *
     * It updates dash_url every 30 minutes.
     */
    private video_url;
    /**
     * No of segments of data to add in stream before starting to loop
     */
    private precache;
    /**
     * Segment sequence number
     */
    private sequence;
    /**
     * Live Stream Class Constructor
     * @param dash_url dash manifest URL
     * @param target_interval interval time for fetching dash data again
     * @param video_url Live Stream video url.
     */
    constructor(dash_url: string, interval: number, video_url: string, precache?: number);
    /**
     * This cleans every used variable in class.
     *
     * This is used to prevent re-use of this class and helping garbage collector to collect it.
     */
    private cleanup;
    /**
     * Updates dash url.
     *
     * Used by dash_timer for updating dash_url every 30 minutes.
     */
    private dash_updater;
    /**
     * Initializes dash after getting dash url.
     *
     * Start if it is first time of initialishing dash function.
     */
    private initialize_dash;
    /**
     * Used only after initializing dash function first time.
     * @param len Length of data that you want to
     */
    private first_data;
    /**
     * This loops function in Live Stream Class.
     *
     * Gets next segment and push it.
     */
    private loop;
    /**
     * Deprecated Functions
     */
    pause(): void;
    /**
     * Deprecated Functions
     */
    resume(): void;
}
/**
 * YouTube Stream Class for playing audio from normal videos.
 */
export declare class Stream {
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
     * @param contentLength Total length of Audio file in bytes.
     * @param video_url YouTube video url.
     * @param options Options provided to stream function.
     */
    constructor(url: string, type: StreamType, duration: number, contentLength: number, video_url: string, options: StreamOptions);
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
/**
 * Timer Class.
 *
 * setTimeout + extra features ( re-starting, pausing, resuming ).
 */
export declare class Timer {
    /**
     * Boolean for checking if Timer is destroyed or not.
     */
    private destroyed;
    /**
     * Boolean for checking if Timer is paused or not.
     */
    private paused;
    /**
     * setTimeout function
     */
    private timer;
    /**
     * Callback to be executed once timer finishes.
     */
    private callback;
    /**
     * Seconds time when it is started.
     */
    private time_start;
    /**
     * Total time left.
     */
    private time_left;
    /**
     * Total time given by user [ Used only for re-using timer. ]
     */
    private time_total;
    /**
     * Constructor for Timer Class
     * @param callback Function to execute when timer is up.
     * @param time Total time to wait before execution.
     */
    constructor(callback: () => void, time: number);
    /**
     * Pauses Timer
     * @returns Boolean to tell that if it is paused or not.
     */
    pause(): boolean;
    /**
     * Resumes Timer
     * @returns Boolean to tell that if it is resumed or not.
     */
    resume(): boolean;
    /**
     * Reusing of timer
     * @returns Boolean to tell if it is re-used or not.
     */
    reuse(): boolean;
    /**
     * Destroy timer.
     *
     * It can't be used again.
     */
    destroy(): void;
}
//# sourceMappingURL=LiveStream.d.ts.map