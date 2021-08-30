import { PassThrough } from 'stream'
import got from 'got'
import { StreamType } from '../stream';
import { Socket } from 'net'

export interface FormatInterface{
    url : string;
    targetDurationSec : number;
    maxDvrDurationSec : number
}

export class LiveStreaming{
    type : StreamType
    stream : PassThrough
    private base_url : string
    private url : string
    private interval : number
    private packet_count : number
    private timer : NodeJS.Timer | null
    private segments_urls : string[]
    private socket : Socket | null
    constructor(dash_url : string, target_interval : number){
        this.type = StreamType.Arbitrary
        this.url = dash_url
        this.base_url = ''
        this.stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.segments_urls = []
        this.packet_count = 0
        this.timer = null
        this.socket = null
        this.interval = target_interval * 1000 || 0
        this.stream.on('close', () => {
            this.cleanup()
        });
        this.start()
    }
    
    private async dash_getter(){
        let response = await got(this.url)
        let audioFormat = response.body.split('<AdaptationSet id="0"')[1].split('</AdaptationSet>')[0].split('</Representation>')
        if(audioFormat[audioFormat.length - 1] === '') audioFormat.pop()
        this.base_url = audioFormat[audioFormat.length - 1].split('<BaseURL>')[1].split('</BaseURL>')[0]
        let list = audioFormat[audioFormat.length - 1].split('<SegmentList>')[1].split('</SegmentList>')[0]
        this.segments_urls = list.replace(new RegExp('<SegmentURL media="', 'g'), '').split('"/>')
        if(this.segments_urls[this.segments_urls.length - 1] === '') this.segments_urls.pop()
    }

    private cleanup(){
        clearTimeout(this.timer as NodeJS.Timer)
        this.socket?.destroy()
        this.socket = null
        this.timer = null
        this.url = ''
        this.base_url = ''
        this.segments_urls = []
        this.packet_count = 0
        this.interval = 0
    }

    private async start(){
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
        await this.dash_getter()
        if(this.packet_count === 0) this.packet_count = Number(this.segments_urls[0].split('sq/')[1].split('/')[0])
        for await (let segment of this.segments_urls){
            if(Number(segment.split('sq/')[1].split('/')[0]) !== this.packet_count){
                continue
            }
            await (async () => {
                return new Promise(async (resolve, reject) => {
                    let stream = got.stream(this.base_url + segment)
                    stream.on('data', (chunk: any) => this.stream.write(chunk))
                    stream.once('data', () => {this.socket = stream.socket as Socket})
                    stream.on('end', () => {
                        this.packet_count++
                        resolve('')
                    })
                })
            })()
        }
        this.timer = setTimeout(() => {
            this.start()
        }, this.interval)
    }
}

export class LiveEnded{
    type : StreamType
    stream : PassThrough
    private url : string;
    private base_url : string;
    private packet_count : number
    private segments_urls : string[]
    private socket : Socket | null
    constructor(dash_url : string){
        this.type = StreamType.Arbitrary
        this.url = dash_url
        this.base_url = ''
        this.stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.segments_urls = []
        this.packet_count = 0
        this.socket = null
        this.stream.on('close', () => {
            this.cleanup()
        })
        this.start()
    }

    private async dash_getter(){
        let response = await got(this.url)
        let audioFormat = response.body.split('<AdaptationSet id="0"')[1].split('</AdaptationSet>')[0].split('</Representation>')
        if(audioFormat[audioFormat.length - 1] === '') audioFormat.pop()
        this.base_url = audioFormat[audioFormat.length - 1].split('<BaseURL>')[1].split('</BaseURL>')[0]
        let list = audioFormat[audioFormat.length - 1].split('<SegmentList>')[1].split('</SegmentList>')[0]
        this.segments_urls = list.replace(new RegExp('<SegmentURL media="', 'g'), '').split('"/>')
        if(this.segments_urls[this.segments_urls.length - 1] === '') this.segments_urls.pop()
    }

    private cleanup(){
        this.socket?.destroy()
        this.socket = null
        this.url = ''
        this.base_url = ''
        this.segments_urls = []
        this.packet_count = 0
    }

    private async start(){
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
        await this.dash_getter()
        if(this.packet_count === 0) this.packet_count = Number(this.segments_urls[0].split('sq/')[1].split('/')[0])
        for await (let segment of this.segments_urls){
            if(this.stream.destroyed){
                this.cleanup()
                break
            }
            if(Number(segment.split('sq/')[1].split('/')[0]) !== this.packet_count){
                continue
            }
            await (async () => {
                return new Promise(async (resolve, reject) => {
                    let stream = got.stream(this.base_url + segment)
                    stream.on('data', (chunk: any) => this.stream.write(chunk))
                    stream.once('data', () => {this.socket = stream.socket as Socket})
                    stream.on('end', () => {
                        this.packet_count++
                        resolve('')
                    })
                })
            })()
        }
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
    private socket : Socket | null
    constructor(url : string, type : StreamType, duration : number){
        this.url = url
        this.type = type
        this.stream = new PassThrough({ highWaterMark : 10 * 1000 * 1000 })
        this.bytes_count = 0
        this.per_sec_bytes = 0
        this.timer = null
        this.socket = null
        this.duration = duration;
        (duration > 300) ? this.loop_start() : this.normal_start()
    }

    private cleanup(){
        clearTimeout(this.timer as NodeJS.Timer)
        this.socket?.destroy()
        this.socket = null
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
        stream.once('data', () => {this.socket = stream.socket as Socket})
    }

    private loop_start(){
        if(this.stream.destroyed){
            this.cleanup()
            return
        }
        let stream = got.stream(this.url)
        stream.once('data', () => {
            this.per_sec_bytes = Math.ceil((stream.downloadProgress.total as number)/this.duration)
            this.socket = stream.socket as Socket
        })

        stream.on('data', (chunk: any) => {
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
        }, 280 * 1000)
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

        stream.on('data', (chunk: any) => {
            absolute_bytes += chunk.length
            this.bytes_count += chunk.length
            this.stream.write(chunk)
        })
        stream.once('data', () => {this.socket = stream.socket as Socket})
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
        }, 300 * 1000)
    }
}
