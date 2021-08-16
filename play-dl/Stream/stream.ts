import { IncomingMessage, ClientRequest } from 'http';
import { Socket } from 'net'
import { EventEmitter } from 'node:events'
import { RequestOptions, default as https } from 'https'
import { URL } from 'url'
import { Transform, PassThrough } from 'stream'

interface StreamOptions extends RequestOptions {
    maxRetries?: number;
    maxReconnects?: number;
    highWaterMark?: number;
    backoff?: { inc: number; max: number };
}

class StreamError extends Error{
    public statusCode? : number;
    constructor(message:string, statusCode? : number){
        super(message)
        this.statusCode = statusCode
    }
}

export interface Stream extends PassThrough {
    abort: (err?: Error) => void;
    aborted: boolean;
    destroy: (err?: Error) => void;
    destroyed: boolean;
    text: () => Promise<string>;
    on(event: 'reconnect', listener: (attempt: number, err?: Error) => void): this;
    on(event: 'retry', listener: (attempt: number, err?: Error) => void): this;
    on(event: 'redirect', listener: (streaming_url: string) => void): this;
    on(event: string | symbol, listener: (...args: any) => void): this;
}

var default_opts : StreamOptions = {
    maxReconnects : 2,
    maxRetries : 5,
    highWaterMark : 15 * 1000 * 1000,
    backoff : {
        inc : 100,
        max : 1000
    }
}

interface RetryOptions {
    err?: Error;
    retryAfter?: number;
}

class Streaming {
    private opts : StreamOptions;
    private stream : Stream;
    private streaming_url : URL;
    private request? : ClientRequest;
    private response? : IncomingMessage;
    private actual_stream : Transform | null;
    private retries : number;
    private retryTime? : NodeJS.Timer;
    private reconnects : number;
    private contentLength : number;
    private downloaded : number;
    private retryStatusCodes = new Set([429, 503]);
    constructor(stream_url : string | URL, options : StreamOptions = {}){
        this.streaming_url = (stream_url instanceof URL) ? stream_url : new URL(stream_url)
        this.opts = Object.assign({}, default_opts, options)
        this.stream = new PassThrough({ highWaterMark: this.opts.highWaterMark }) as Stream
        this.stream.destroyed = this.stream.aborted = false
        this.retries = 0
        this.reconnects = 0
        this.contentLength = 0
        this.downloaded = 0
        this.actual_stream = null
    }

    creation = () => {
        process.nextTick(() => this.download())
        return this.stream
    }

    private downloadStarted = () => { return Boolean(this.actual_stream && this.downloaded > 0) }
    private downloadCompleted = () => { return Boolean(this.downloaded === this.contentLength) }

    private reconnect = (err? : StreamError) => {
        this.actual_stream = null
        this.retries = 0
        let ms = Math.min(this.opts.backoff?.inc as number, this.opts.backoff?.max as number)
        this.retryTime = setTimeout(this.download , ms)
        this.stream.emit('reconnect', this.reconnects, err)
    }

    private Earlyreconnect = (err? : StreamError) => {
        if(this.opts.method !== 'HEAD' && !this.downloadCompleted() && this.reconnects++ < (this.opts.maxReconnects as number)){
            this.reconnect(err)
            return true
        }
        else return false
    }

    private retryrequest = (retryOptions : RetryOptions) => {
        if(!this.opts.backoff?.inc || this.stream.destroyed) return false
        if(this.downloadStarted()){
            return this.Earlyreconnect(retryOptions.err)
        }
        else if((!retryOptions.err || retryOptions.err.message === 'ENOTFOUND') && this.reconnects++ < (this.opts.maxReconnects as number)){
            let ms = retryOptions.retryAfter ||
            Math.min(this.retries * this.opts.backoff.inc, this.opts.backoff.max);
            this.retryTime = setTimeout(this.download, ms)
            return true
        }
        return false
    }

    private OnError = (err? : StreamError) => {
        if (this.stream.destroyed || this.stream.readableEnded) { return; }
            this.cleanup();
        if (!this.retryrequest({ err })) {
            this.stream.emit('error', err);
        } else {
            this.request?.removeListener('close', this.onRequestClose);
        }
    }

    private onRequestClose = () => {
        this.cleanup();
        this.retryrequest({})
    }

    private cleanup = () => {
        this.request?.removeListener('close', this.onRequestClose)
        this.response?.removeListener('data', this.OnData)
        this.stream.removeListener('end', this.OnEnd)
    }

    private OnData(chunk : Buffer){
        this.downloaded += chunk.length
    }

    private OnEnd = () => {
        this.cleanup()
        if(!this.Earlyreconnect()){
            this.stream.end()
        }
    }

    private forwardEvents = (ee: EventEmitter, events: string[]) => {
        for (let event of events) {
          ee.on(event, this.stream.emit.bind(this.stream, event));
        }
    };

    private download = () => {
        let parsed : RequestOptions = {}
        parsed = {
            host : this.streaming_url.host,
            hostname : this.streaming_url.hostname,
            path : this.streaming_url.pathname + this.streaming_url.search + this.streaming_url.hash,
            port : this.streaming_url.port,
            protocol : this.streaming_url.protocol
        }
        if(this.streaming_url.username){
            parsed.auth = `${this.streaming_url.username}:${this.streaming_url.password}`
        }

        Object.assign(parsed, this.opts)
        this.request = https.request(parsed, (res : IncomingMessage) => this.OnResponse(res))
        this.request?.on('error', this.OnError)
        this.request.on('close', this.onRequestClose)
        this.forwardEvents(this.request, ['connect', 'continue', 'information', 'socket', 'timeout', 'upgrade'])
        if (this.stream.destroyed) {
            this.Destroy();
          }
          this.stream.emit('request', this.request);
          this.request.end();
    }

    private Destroy = () => {
        this.request?.destroy(new Error('Some Error Occured'))
        this.actual_stream?.unpipe()
        this.actual_stream?.destroy()
        clearTimeout(this.retryTime as NodeJS.Timer)
    }

    private OnResponse = (res : IncomingMessage) => {
        if(this.stream.destroyed) return

        if(this.retryStatusCodes.has(res.statusCode as number)){
            if(!this.retryrequest({ retryAfter: parseInt(res.headers['retry-after'] || '0', 10) })){
                let err = new StreamError(`Status code: ${res.statusCode}`, res.statusCode)
                this.stream.emit('error', err)
            }
            this.cleanup();
            return;
        }
        else if(res.statusCode && (res.statusCode < 200 || res.statusCode >= 400)){
            let err = new StreamError(`Status code: ${res.statusCode}`, res.statusCode);
            if (res.statusCode >= 500) {
                this.OnError(err);
            } else {
                this.stream.emit('error', err);
            }
            this.cleanup();
            return;
        }

        if(!this.contentLength){
            this.contentLength = parseInt(`${res.headers['content-length']}`, 10)
        }

        this.actual_stream = res as unknown as Transform
        res.on('data', this.OnData)
        this.actual_stream.on('end', this.OnEnd)
        this.actual_stream.pipe(this.stream)
        this.response = res
        this.stream.emit('response', res)
        res.on('error', this.OnError)
        this.forwardEvents(res, ['aborted'])
    }


}

export function stream(stream_url : string | URL, options? : StreamOptions){
    let new_stream = new Streaming(stream_url, options)
    return new_stream.creation()
}