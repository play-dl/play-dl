import fetch from 'node-fetch'
import fs from 'fs'
import got from 'got'

export function valid_url(url : string): boolean{
    let valid_url = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|watch|v|shorts)(\/|\?))/
    if(url.search(valid_url) !== -1) return true
    else return false
}

export async function getBasicInfo(url : string){
    if(valid_url(url)){
        let body = await url_get(url)
        let final = {
            player_response : get_ytPlayerResponse(body),
            response : get_ytInitialData(body),
            js_url : js_url(body)
        }
    }
    else {
        throw 'Not a Valid YouTube URL'
    }
}

function js_url(data:string): string {
    return data.split('"jsUrl":"')[1].split('"')[0]
}

function get_ytPlayerResponse(data : string): JSON {
    return JSON.parse(data.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0])
}

function get_ytInitialData(data:string): JSON {
    return JSON.parse(data.split("var ytInitialData = ")[1].split(";</script>")[0])
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
