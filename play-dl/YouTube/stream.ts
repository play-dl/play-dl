import got from "got"
import { video_info } from "."


interface FilterOptions {
    averagebitrate? : number;
    videoQuality? : "144p" | "240p" | "360p" | "480p" | "720p" | "1080p";
    audioQuality? : "AUDIO_QUALITY_LOW" | "AUDIO_QUALITY_MEDIUM";
    audioSampleRate? : number;
    audioChannels? : number;
    audioCodec? : string;
    audioContainer? : string;
    hasAudio? : boolean;
    hasVideo? : boolean;
    isLive? : boolean;
}

interface StreamOptions {
    filter : "bestaudio" | "bestvideo"
}

function parseFormats(formats : any[]): { audio: any[], video:any[] } {
    let audio: any[] = []
    let video: any[] = []
    formats.forEach((format) => {
        let type = format.mimeType as string
        if(type.startsWith('audio')){
            format.audioCodec = type.split('codecs="')[1].split('"')[0]
            format.audioContainer = type.split('audio/')[1].split(';')[0]
            format.hasAudio = true
            format.hasVideo = false
            audio.push(format)
        }
        else if(type.startsWith('video')){
            format.videoQuality = format.qualityLabel
            format.hasAudio = false
            format.hasVideo = true
            video.push(format)
        }
    })
    return { audio, video }
}

function filter_songs(formats : any[], options : FilterOptions) {
}

export async function stream(url : string, options? : StreamOptions){
    let info = await video_info(url)
    let final: any[] = [];

    if(options?.filter === 'bestaudio'){
        info.format.forEach((format) => {
            let type = format.mimeType as string
            if(type.startsWith('audio/webm')){
                return final.push(format)
            }
            else return
        })

        if(final.length === 0){
            info.format.forEach((format) => {
                let type = format.mimeType as string
                if(type.startsWith('audio/')){
                    return final.push(format)
                }
                else return
            })
        }
    }
    else if(options?.filter === 'bestvideo'){
        info.format.forEach((format) => {
            let type = format.mimeType as string
            if(type.startsWith('video/')){
                if(parseInt(format.qualityLabel) > 480) final.push(format)
                else return
            }
            else return
        })

        if(final.length === 0) throw new Error("Video Format > 480p is not found")
    }
    else{
        final.push(info.format[info.format.length - 1])
    }

    return got.stream(final[0].url, {
        retry : 5,
    })
}