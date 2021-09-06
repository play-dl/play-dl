import got from "got/dist/source"
import { SpotifyAlbum, SpotifyPlaylist, SpotifyVideo } from "./classes"


const pattern = /^((https:)?\/\/)?open.spotify.com\/(track|album|playlist)\//

export async function spotify(url : string): Promise<SpotifyAlbum | SpotifyPlaylist | SpotifyVideo>{
    if(!url.match(pattern)) throw new Error('This is not a Spotify URL')
    let embed = embed_url(url)
    let response = await got(embed)
    return parse_json(embed, response.body)
}

function parse_json(url : string, data : string): SpotifyAlbum | SpotifyPlaylist | SpotifyVideo{
    let json_data = JSON.parse(decodeURIComponent(data.split('<script id="resource" type="application/json">')[1].split('</script>')[0]))
    if(url.indexOf('track') !== -1){
        return new SpotifyVideo(json_data)
    }
    else if(url.indexOf('album') !== -1){
        return new SpotifyAlbum(json_data)
    }
    else if(url.indexOf('playlist') !== -1){
        return new SpotifyPlaylist(json_data)
    }
    else throw new Error('Failed to parse data')
}

function embed_url(url : string): string{
    if(url.indexOf('track/') !== -1){
        let trackID = url.split('track/')[1].split('?')[0].split('/')[0].split('&')[0]
        return `https://open.spotify.com/embed/track/${trackID}`
    }
    else if(url.indexOf('album/') !== -1){
        let albumID = url.split('album/')[1].split('?')[0].split('/')[0].split('&')[0]
        return `https://open.spotify.com/embed/album/${albumID}`
    }
    else if(url.indexOf('playlist/') !== -1){
        let playlistID = url.split('playlist/')[1].split('?')[0].split('/')[0].split('&')[0]
        return `https://open.spotify.com/embed/playlist/${playlistID}`
    }
    else throw new Error('Unable to generate embed url for given spotify url.')
}

export function sp_validate(url : string): "track" | "playlist" | "album" | boolean{
    if(!url.match(pattern)) return false
    if(url.indexOf('track/') !== -1){
        return "track"
    }
    else if(url.indexOf('album/') !== -1){
        return "album"
    }
    else if(url.indexOf('playlist/') !== -1){
        return "playlist"
    }
    else return false
}