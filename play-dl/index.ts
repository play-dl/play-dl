export { playlist_info, video_basic_info, video_info, search, stream, stream_from_info, yt_validate, extractID } from "./YouTube";

export { spotify, sp_validate, Authorization, StartSpotify, RefreshToken, is_expired } from './Spotify'

import { sp_validate, yt_validate } from ".";

export function validate(url : string): string | boolean{
    if(url.indexOf('spotify') !== -1){
        let check = sp_validate(url)
        if(check){
            return "sp_" + check
        }
        else return check
    }
    else{
        let check = yt_validate(url)
        if(check){
            return "yt_" + check
        }
        else return check
    }
}