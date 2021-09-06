import got from "got/dist/source"
import { video_info } from "."
import { LiveStreaming, Stream } from "./classes/LiveStream"

export enum StreamType{
    Arbitrary = 'arbitrary',
	Raw = 'raw',
	OggOpus = 'ogg/opus',
	WebmOpus = 'webm/opus',
	Opus = 'opus',
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

export async function stream(url : string, cookie? : string): Promise<Stream | LiveStreaming>{
    let info = await video_info(url, cookie)
    let final: any[] = [];
    let type : StreamType;
    if(info.LiveStreamData.isLive === true && info.LiveStreamData.hlsManifestUrl !== null && info.video_details.durationInSec === '0') {
        return new LiveStreaming(info.LiveStreamData.dashManifestUrl, info.format[info.format.length - 1].targetDurationSec, info.video_details.url)
    }
    let resp = await got(info.format[info.format.length - 1].url, {
        headers : {
            "range" : `bytes=0-1`
        },
        retry : 0
    }).catch(() => {
        return 0
    })
    if(resp === 0){
        return await stream(info.video_details.url)
    }
    else if(typeof resp !== "number") resp.destroy()

    let audioFormat = parseAudioFormats(info.format)
    let opusFormats = filterFormat(audioFormat, "opus")

    if(opusFormats.length === 0){
        type = StreamType.Arbitrary
        final.push(audioFormat[audioFormat.length - 1])
    }
    else{
        type = StreamType.WebmOpus
        final.push(opusFormats[opusFormats.length - 1])
    }

    if(final.length === 0) {
        type = StreamType.Arbitrary
        final.push(info.format[info.format.length - 1])
    }
    
    return new Stream(final[0].url, type, info.video_details.durationInSec) 
}

export async function stream_from_info(info : InfoData): Promise<Stream | LiveStreaming>{
    let final: any[] = [];
    let type : StreamType;
    if(info.LiveStreamData.isLive === true && info.LiveStreamData.hlsManifestUrl !== null && info.video_details.durationInSec === '0') {
        return new LiveStreaming(info.LiveStreamData.dashManifestUrl, info.format[info.format.length - 1].targetDurationSec, info.video_details.url)
    }

    let resp = await got(info.format[info.format.length - 1].url, {
        headers : {
            "range" : `bytes=0-1`
        },
        retry : 0
    }).catch(() => {
        return 0
    })
    if(resp === 0){
        return await stream(info.video_details.url)
    }
    else if(typeof resp !== "number") resp.destroy()

    let audioFormat = parseAudioFormats(info.format)
    let opusFormats = filterFormat(audioFormat, "opus")

    if(opusFormats.length === 0){
        type = StreamType.Arbitrary
        final.push(audioFormat[audioFormat.length - 1])
    }
    else{
        type = StreamType.WebmOpus
        final.push(opusFormats[opusFormats.length - 1])
    }

    if(final.length === 0) {
        type = StreamType.Arbitrary
        final.push(info.format[info.format.length - 1])
    }
    
    return new Stream(final[0].url, type, info.video_details.durationInSec) 
}

function filterFormat(formats : any[], codec : string){
    let result: any[] = []
    formats.forEach((format) => {
        if(format.codec === codec) result.push(format)
    })
    return result
}
