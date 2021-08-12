import fetch from 'node-fetch'
import { format_decipher, js_tokens } from './cipher'

export function valid_url(url : string): boolean{
    let valid_url = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|watch|v|shorts)(\/|\?))/
    if(url.search(valid_url) !== -1) return true
    else return false
}

export async function yt_initial_data(url : string){
    if(valid_url(url)){
        let body = await url_get(url)
        let player_response = JSON.parse(body.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0])
        let response = JSON.parse(body.split("var ytInitialData = ")[1].split(";</script>")[0])
        let html5player =  'https://www.youtube.com' + body.split('"jsUrl":"')[1].split('"')[0]
        let format = []
        format.push(player_response.streamingData.formats[0])
        format.push(...player_response.streamingData.adaptiveFormats)
        let vid = player_response.videoDetails
        let microformat = player_response.microformat.playerMicroformatRenderer
        let video_details = {
            id : vid.videoId,
            url : 'https://www.youtube.com/watch?v=' + vid.videoId,
            title : vid.title,
            description : vid.shortDescription,
            duration : vid.lengthSeconds,
            uploadedDate : microformat.publishDate,
            thumbnail : `https://i.ytimg.com/vi/${vid.videoId}/maxresdefault.jpg`,
            channel : {
                name : vid.author,
                id : vid.channelId,
                url : `https://www.youtube.com/channel/${vid.channelId}`
            },
            views : vid.viewCount,
            tags : vid.keywords,
            averageRating : vid.averageRating,
            live : vid.isLiveContent,
            private : vid.isPrivate
        }
        let final = {
            player_response,
            response,
            html5player,
            format,
            video_details
        }
        return final
    }
    else {
        throw 'Not a Valid YouTube URL'
    }
}

export async function yt_deciphered_data(url : string) {
    let data = await yt_initial_data(url)
    if(data.format[0].signatureCipher || data.format[0].cipher){
        data.format = await format_decipher(data.format, data.html5player)
        return data
    }
    else {
        return data
    }
}

export async function url_get (url : string) : Promise<string>{
    return new Promise(async(resolve, reject) => {
        let response = await fetch(url)

        if(response.status === 200) {
            resolve(await response.text())
        }
        else reject(`Got ${response.status} from ${url}`)
    })
}
