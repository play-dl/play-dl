import { get } from "./request";
import fs from 'fs'

export function valid_url(url : string): boolean{
    let valid_url = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|watch|v|shorts)(\/|\?))/
    if(url.search(valid_url) !== -1) return true
    else return false
}

export async function getBasicInfo(url : string){
    if(valid_url(url)){
        let body = await get(url)
        var final ={
            initial_data : yt_initial_data(body)
        }
    }
    else {
        throw 'Not a Valid YouTube URL'
        process.exit(1)
    }
}

function parse_json(str : string, start_index : number){
    let matches = 0
    let result : string = '';
    if(str[start_index] !== '{') {
        throw 'Start Index is wrong.'
        process.exit(1)
    }

    matches++
    result += str[start_index]
    for(let x = start_index + 1; x <= str.length; x++){
        if(matches === 0) break
        if(str[x] === '(' || str[x] === '{' || str[x] === '[') matches++
        if(str[x] === ')' || str[x] === '}' || str[x] === ']') matches--
        result += str[x]
    }
    return JSON.parse(result)
}

function yt_initial_data(data : string): JSON{
    let pattern = /ytInitialData\s=\s/
    return parse_json(data, data.search(pattern) + 16)
}