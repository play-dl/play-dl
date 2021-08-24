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
    stream : PassThrough
    private low_latency : boolean;
    private format : FormatInterface
    private interval : number
    private packet_count : number
    private timer : NodeJS.Timer | null
    private segments_urls : string[]
    constructor(format : FormatInterface, low_latency : boolean){
        this.type = StreamType.Arbitrary
        this.low_latency = low_latency || false
        this.format = format
        this.stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.segments_urls = []
        this.packet_count = 0
        this.interval = (this.format.targetDurationSec / 2) * 1000 || 0
        this.timer = null
        this.stream.on('close', () => {
            this.cleanup()
        });
        (this.low_latency) ? this.live_loop() :this.start()
    }
    
    private async live_loop(){
        if(this.stream.destroyed) {
            this.cleanup()
            return
        }
        await this.manifest_getter()
        this.segments_urls.splice(0, this.segments_urls.length - 2)
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
        this.timer = setTimeout(async () => {
            await this.looping()
        }, this.interval)
    }

    private async looping(){
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
        await this.manifest_getter()
        this.segments_urls.splice(0, (this.segments_urls.length / 2))
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
        this.timer = setTimeout(async () => {
            await this.looping()
        }, this.interval)
    }

    private async manifest_getter(){
        let response = await got(this.format.url)
        this.segments_urls = response.body.split('\n').filter((x) => x.startsWith('https'))
    }

    private cleanup(){
        clearTimeout(this.timer as NodeJS.Timer)
        this.timer = null
        this.segments_urls = []
        this.packet_count = 0
    }

    private async start(){
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
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
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
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
    stream : PassThrough
    private url : string
    private bytes_count : number;
    private per_sec_bytes : number;
    private duration : number;
    private timer : NodeJS.Timer | null
    constructor(url : string, type : StreamType, duration : number){
        this.url = url
        this.type = type
        this.stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.bytes_count = 0
        this.per_sec_bytes = 0
        this.timer = null
        this.duration = duration;
        (duration > 300) ? this.loop_start() : this.normal_start()
    }

    private cleanup(){
        clearTimeout(this.timer as NodeJS.Timer)
        this.timer = null
        this.url = ''
        this.bytes_count = 0
        this.per_sec_bytes = 0
    }

    private normal_start(){
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
        let stream = got.stream(this.url)
        stream.pipe(this.stream)
    }

    private loop_start(){
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
        let stream = got.stream(this.url)
        stream.once('data', () => {
            this.per_sec_bytes = Math.ceil((stream.downloadProgress.total as number)/this.duration)
        })

        stream.on('data', (chunk) => {
            this.bytes_count += chunk.length
            this.stream.write(chunk)
        })

        stream.on('data', () => {
            if(this.bytes_count > (this.per_sec_bytes * 300)){
                stream.destroy()
            }
        })

        this.timer = setTimeout(() => {
            this.loop()
        }, 290 * 1000)
    }

    private loop(){
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
        let absolute_bytes : number = 0
        let stream = got.stream(this.url, {
            headers : {
                "range" : `bytes=${this.bytes_count}-`
            }
        })

        stream.on('data', (chunk) => {
            absolute_bytes += chunk.length
            this.bytes_count += chunk.length
            this.stream.write(chunk)
        })

        stream.on('data', () => {
            if(absolute_bytes > (this.per_sec_bytes * 300)){
                stream.destroy()
            }
        })

        stream.on('end', () => {
            this.cleanup()
        })

        this.timer = setTimeout(() => {
            this.loop()
        }, 290 * 1000)
    }
}
