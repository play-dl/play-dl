import got from "got"
import { video_info } from "."
import { PassThrough } from 'stream'
import https from 'https'
import { FormatInterface, LiveEnded, LiveStreaming } from "./classes/LiveStream"

enum StreamType{
    Arbitrary = 'arbitrary',
	Raw = 'raw',
	OggOpus = 'ogg/opus',
	WebmOpus = 'webm/opus',
	Opus = 'opus',
}

interface StreamOptions {
    smooth : boolean
}

interface InfoData{
    LiveStreamData : {
        isLive : boolean
        dashManifestUrl : string
        hlsManifestUrl : string
    }
    html5player : string
    format : any[]
    video_details : any
}

function parseAudioFormats(formats : any[]){
    let result: any[] = []
    formats.forEach((format) => {
        let type = format.mimeType as string
        if(type.startsWith('audio')){
            format.codec = type.split('codecs="')[1].split('"')[0]
            format.container = type.split('audio/')[1].split(';')[0]
            result.push(format)
        }
    })
    return result
}

export async function stream(url : string, options : StreamOptions = { smooth : false }): Promise<PassThrough>{
    let info = await video_info(url)
    let final: any[] = [];
    
    if(info.LiveStreamData.isLive === true && info.LiveStreamData.hlsManifestUrl !== null) {
        return await live_stream(info as InfoData, options.smooth)
    }

    let audioFormat = parseAudioFormats(info.format)
    let opusFormats = filterFormat(audioFormat, "opus")

    if(opusFormats.length === 0){
        final.push(audioFormat[audioFormat.length - 1])
    }
    else{
        final.push(opusFormats[opusFormats.length - 1])
    }

    if(final.length === 0) final.push(info.format[info.format.length - 1])
    let piping_stream = got.stream(final[0].url, {
        retry : 5,
        headers: {
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
        },
        agent : {
            https : new https.Agent({ keepAlive : true })
        },
        http2 : true
    })
    let playing_stream = new PassThrough({ highWaterMark: 10 * 1000 * 1000 })

    piping_stream.pipe(playing_stream)
    return playing_stream
}

export async function stream_from_info(info : InfoData, options : StreamOptions){
    let final: any[] = [];
    
    if(info.LiveStreamData.isLive === true) {
        return await live_stream(info as InfoData, options.smooth)
    }

    let audioFormat = parseAudioFormats(info.format)
    let opusFormats = filterFormat(audioFormat, "opus")

    if(opusFormats.length === 0){
        final.push(audioFormat[audioFormat.length - 1])
    }
    else{
        final.push(opusFormats[opusFormats.length - 1])
    }

    if(final.length === 0) final.push(info.format[info.format.length - 1])
    let piping_stream = got.stream(final[0].url, {
        retry : 5,
        headers: {
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
        },
        agent : {
            https : new https.Agent({ keepAlive : true })
        },
        http2 : true
    })
    let playing_stream = new PassThrough({ highWaterMark: 10 * 1000 * 1000 })

    piping_stream.pipe(playing_stream)
    return playing_stream
}

function filterFormat(formats : any[], codec : string){
    let result: any[] = []
    formats.forEach((format) => {
        if(format.codec === codec) result.push(format)
    })
    return result
}

export function stream_type(info:InfoData): StreamType{
    if(info.LiveStreamData.isLive === true && info.LiveStreamData.hlsManifestUrl !== null) return StreamType.Arbitrary
    else return StreamType.WebmOpus
}

async function live_stream(info : InfoData, smooth : boolean): Promise<PassThrough>{
    let res_144 : FormatInterface = {
        url : '',
        targetDurationSec : 0,
        maxDvrDurationSec : 0
    }
    info.format.forEach((format) => {
        if(format.qualityLabel === '144p') res_144 = format
        else return
    })
    let stream : LiveStreaming | LiveEnded
    if(info.video_details.duration === '0') {
        stream = new LiveStreaming((res_144.url.length !== 0) ? res_144 : info.format[info.format.length - 1], smooth)
    }
    else {
        stream = new LiveEnded((res_144.url.length !== 0) ? res_144 : info.format[info.format.length - 1])
    }
    return stream.stream
}