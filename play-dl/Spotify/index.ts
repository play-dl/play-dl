import got from "got/dist/source"
import { SpotifyAlbum, SpotifyPlaylist, SpotifyVideo } from "./classes"
import readline from 'readline'
import fs from 'fs'

interface SpotifyDataOptions{
    client_id : string;
    client_secret : string;
    redirect_url : string;
    authorization_code? :string;
    access_token? : string;
    refresh_token? : string;
    token_type? : string;
    expires_in? : number;
}

const ask = readline.createInterface({
    input : process.stdin,
    output : process.stdout
})

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

export function Authorization(){
    let client_id : string, client_secret : string, redirect_url : string;
    let code : string;
    ask.question('Client ID : ', (id) => {
        client_id = id
        ask.question('Client Secret : ', (secret) => {
            client_secret = secret
            ask.question('Redirect URL : ', (url) => {
                redirect_url = url
                console.log('Now Go to this url in your browser and Paste this url. Answer the next question \n')
                console.log(`https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURI(redirect_url)} \n`)
                ask.question('Redirected URL : ', (url) => {
                    code = url.split('code=')[1]
                    if (!fs.existsSync('.data')) fs.mkdirSync('.data')
                    fs.writeFileSync('.data/spotify.data', JSON.stringify({
                        client_id,
                        client_secret,
                        redirect_url,
                        authorization_code : code
                    }))
                    ask.close()
                })
            })
        })
    })
}

export async function StartSpotify(){
    if(!fs.existsSync('.data/spotify.data')) throw new Error('Spotify Data is Missing\nDid you forgot to do authorization ?')

    let data: SpotifyDataOptions = JSON.parse(fs.readFileSync('.data/spotify.data').toString())

    if(data.authorization_code) data = await SpotifyAuthorize(data)
    
}

async function SpotifyAuthorize(data : SpotifyDataOptions): Promise<SpotifyDataOptions>{
    let response = await got.post(`https://accounts.spotify.com/api/token?grant_type=authorization_code&code=${data.authorization_code}&redirect_uri=${encodeURI(data.redirect_url)}`, {
        headers : {
            "Authorization" : `Basic ${Buffer.from(`${data.client_id}:${data.client_secret}`).toString('base64')}`,
            "Content-Type" : "application/x-www-form-urlencoded"
        }
    })
    
    if(response.statusCode === 200) {
        let resp_json = JSON.parse(response.body)
        return{
            client_id : data.client_id,
            client_secret : data.client_secret,
            redirect_url : data.redirect_url,
            access_token : resp_json.access_token,
            refresh_token : resp_json.refresh_token,
            expires_in : Number(resp_json.expires_in),
            token_type : resp_json.token_type
        }
    }
    else throw new Error(`Got ${response.statusCode} while getting spotify access token\n${response.body}`)
}