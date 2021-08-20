import { PassThrough } from 'stream'
import got from 'got'

export interface FormatInterface{
    url : string;
    targetDurationSec : number;
    maxDvrDurationSec : number
}

export class LiveStreaming{
    smooth : boolean;
    private __stream : PassThrough
    private format : FormatInterface
    private interval : number
    private packet_count : number
    private timer : NodeJS.Timer | null
    private segments_urls : string[]
    constructor(format : FormatInterface, smooth : boolean){
        this.smooth = smooth || false
        this.format = format
        this.__stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.segments_urls = []
        this.packet_count = 0
        this.interval = 0
        this.timer = null
        this.__stream.on('close', () => {
            this.cleanup()
        })
        if(this.smooth === true) this.__stream.pause()
        this.start()
    }
    
    async manifest_getter(){
        let response = await got(this.format.url)
        this.segments_urls = response.body.split('\n').filter((x) => x.startsWith('https'))
    }

    get stream(){
        return this.__stream
    }

    private cleanup(){
        clearInterval(this.timer as NodeJS.Timer)
        this.segments_urls = []
        this.packet_count = 0
    }

    async start(){
        if(this.__stream.destroyed) this.cleanup()
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
                    stream.on('data', (chunk) => this.__stream.write(chunk))
                    stream.on('end', () => {
                        this.packet_count++
                        resolve('')
                    })
                })
            })()
        }
        this.interval = (this.segments_urls.length / 2) * 1000
        this.timer = setTimeout(async () => {
            if(this.smooth === true){
                this.__stream.resume()
                this.smooth = false
            }
            await this.start()
        }, this.interval)
    }

    private got_stream(url: string){
        return got.stream(url)
    }
}

export class LiveEnded{
    private __stream : PassThrough
    private format : FormatInterface
    private packet_count : number
    private segments_urls : string[]
    constructor(format : FormatInterface){
        this.format = format
        this.__stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.segments_urls = []
        this.packet_count = 0
        this.__stream.on('close', () => {
            this.cleanup()
        })
        this.start()
    }
    
    async manifest_getter(){
        let response = await got(this.format.url)
        this.segments_urls = response.body.split('\n').filter((x) => x.startsWith('https'))
    }

    get stream(){
        return this.__stream
    }

    private cleanup(){
        this.segments_urls = []
        this.packet_count = 0
    }

    async start(){
        if(this.__stream.destroyed) this.cleanup()
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
                    stream.on('data', (chunk) => this.__stream.write(chunk))
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

