import got from "got"
import { video_info } from "."
import { PassThrough } from 'stream'
import https from 'https'


interface StreamOptions {
    filter : "bestaudio" | "bestvideo" | "live"
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

function parseVideoFormats(formats : any[]){
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

export async function stream(url : string, options? : StreamOptions): Promise<PassThrough>{
    let info = await video_info(url)
    let final: any[] = [];

    if(info.video_details.live === true && options) {
        options.filter = "live"
    }

    if(options?.filter){
        switch(options.filter){
            case "bestaudio":
                let audioFormat = parseAudioFormats(info.format)
                if(audioFormat.length === 0) await stream(url, { filter : "bestvideo" })
                let opusFormats = filterFormat(audioFormat, "opus")
                if(opusFormats.length === 0){
                    final.push(audioFormat[audioFormat.length - 1])
                }
                else{
                    final.push(opusFormats[opusFormats.length - 1])
                }
                break
            case "bestvideo" :
                let videoFormat = parseVideoFormats(info.format)
                if(videoFormat.length === 0) throw new Error('Can\'t Find Video Formats ')
                let qual_1080 = filterVideo(videoFormat, "1080p") 
                if(qual_1080.length === 0) {
                    let qual_720 = filterVideo(videoFormat, "720p")
                    if(qual_720.length === 0) final.push(videoFormat[0])
                    else final.push(qual_720)
                    break
                }
                else final.push(qual_1080)
                break
                
        }
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

function filterVideo(formats : any[], quality : string) {
    let result: any[] = []
    formats.forEach((format) => {
        if(format.qualityLabel === quality) result.push(format)
    })
    return result
}