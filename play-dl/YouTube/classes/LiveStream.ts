import { PassThrough } from 'stream'
import got from 'got'
import Request from 'got/dist/source/core';
import { StreamType } from '../stream';

export interface FormatInterface{
    url : string;
    targetDurationSec : number;
    maxDvrDurationSec : number
}

export class LiveStreaming{
    type : StreamType
    actual_live : boolean;
    stream : PassThrough
    private format : FormatInterface
    private interval : number
    private packet_count : number
    private timer : NodeJS.Timer | null
    private segments_urls : string[]
    constructor(format : FormatInterface, actual_live : boolean){
        this.type = StreamType.Arbitrary
        this.actual_live = actual_live || false
        this.format = format
        this.stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.segments_urls = []
        this.packet_count = 0
        this.interval = 0
        this.timer = null
        this.stream.on('close', () => {
            this.cleanup()
        });
        (this.actual_live) ? this.live_loop() :this.start()
    }
    
    private async live_loop(){
        if(this.stream.destroyed) this.cleanup()
        await this.manifest_getter()
        this.segments_urls.splice(0, (this.segments_urls.length / 2))
        if(this.packet_count === 0) this.packet_count = Number(this.segments_urls[0].split('index.m3u8/sq/')[1].split('/')[0])
        for await (let url of this.segments_urls){
            await (async () => {
                return new Promise(async (resolve, reject) => {
                    if(Number(url.split('index.m3u8/sq/')[1].split('/')[0]) !== this.packet_count){
                        resolve('')
                        return
                    }
                    let stream = this.got_stream(url)
                    stream.on('data', (chunk) => this.stream.write(chunk))
                    stream.on('end', () => {
                        this.packet_count++
                        resolve('')
                    })
                })
            })()
        }
        this.interval = 1
        this.timer = setTimeout(async () => {
            await this.looping()
        }, this.interval)
    }

    private async looping(){
        if(this.stream.destroyed) this.cleanup()
        await this.manifest_getter()
        for await (let url of this.segments_urls){
            await (async () => {
                return new Promise(async (resolve, reject) => {
                    if(Number(url.split('index.m3u8/sq/')[1].split('/')[0]) !== this.packet_count){
                        resolve('')
                        return
                    }
                    let stream = this.got_stream(url)
                    stream.on('data', (chunk) => this.stream.write(chunk))
                    stream.on('end', () => {
                        this.packet_count++
                        resolve('')
                    })
                })
            })()
        }
        this.interval = 1
        this.timer = setTimeout(async () => {
            await this.looping()
        }, this.interval)
    }

    private async manifest_getter(){
        let response = await got(this.format.url)
        this.segments_urls = response.body.split('\n').filter((x) => x.startsWith('https'))
    }

    private cleanup(){
        clearInterval(this.timer as NodeJS.Timer)
        this.segments_urls = []
        this.packet_count = 0
    }

    private async start(){
        if(this.stream.destroyed) this.cleanup()
        await this.manifest_getter()
        if(this.packet_count === 0) this.packet_count = Number(this.segments_urls[0].split('index.m3u8/sq/')[1].split('/')[0])
        for await (let url of this.segments_urls){
            await (async () => {
                return new Promise(async (resolve, reject) => {
                    if(Number(url.split('index.m3u8/sq/')[1].split('/')[0]) !== this.packet_count){
                        resolve('')
                        return
                    }
                    let stream = this.got_stream(url)
                    stream.on('data', (chunk) => this.stream.write(chunk))
                    stream.on('end', () => {
                        this.packet_count++
                        resolve('')
                    })
                })
            })()
        }
        this.interval = (this.segments_urls.length / 2) * 1000
        this.timer = setTimeout(async () => {
            await this.start()
        }, this.interval)
    }

    private got_stream(url: string){
        return got.stream(url)
    }
}

export class LiveEnded{
    type : StreamType
    stream : PassThrough
    private format : FormatInterface
    private packet_count : number
    private segments_urls : string[]
    constructor(format : FormatInterface){
        this.type = StreamType.Arbitrary
        this.format = format
        this.stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.segments_urls = []
        this.packet_count = 0
        this.stream.on('close', () => {
            this.cleanup()
        })
        this.start()
    }
    
    async manifest_getter(){
        let response = await got(this.format.url)
        this.segments_urls = response.body.split('\n').filter((x) => x.startsWith('https'))
    }

    private cleanup(){
        this.segments_urls = []
        this.packet_count = 0
    }

    async start(){
        if(this.stream.destroyed) this.cleanup()
        await this.manifest_getter()
        if(this.packet_count === 0) this.packet_count = Number(this.segments_urls[0].split('index.m3u8/sq/')[1].split('/')[0])
        for await (let url of this.segments_urls){
            await (async () => {
                return new Promise(async (resolve, reject) => {
                    if(Number(url.split('index.m3u8/sq/')[1].split('/')[0]) !== this.packet_count){
                         resolve('')
                         return
                    }
                    let stream = this.got_stream(url)
                    stream.on('data', (chunk) => this.stream.write(chunk))
                    stream.on('end', () => {
                        this.packet_count++
                        resolve('')
                    })
                })
            })()
        }
    }

    private got_stream(url: string){
        return got.stream(url)
    }
}

export class Stream {
    type : StreamType
    private piping_stream : Request
    private playing_stream : PassThrough
    constructor(url : string, type : StreamType){
        this.type = type
        this.piping_stream = got.stream(url)
        this.playing_stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.piping_stream.pipe(this.playing_stream)
    }

    get stream(){
        return this.playing_stream
    }
}