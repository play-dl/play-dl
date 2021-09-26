export { playlist_info, video_basic_info, video_info, search, yt_validate, extractID } from './YouTube';
export { spotify, sp_validate, refreshToken, is_expired } from './Spotify';
export { soundcloud, so_validate } from './SoundCloud';

import readline from 'readline';
import fs from 'fs';
import { sp_validate, yt_validate, so_validate } from '.';
import { SpotifyAuthorize } from './Spotify';
import { check_id, stream as so_stream, stream_from_info as so_stream_info } from './SoundCloud';
import { InfoData, stream as yt_stream, stream_from_info as yt_stream_info } from './YouTube/stream';
import { SoundCloudTrack, Stream as SoStream } from './SoundCloud/classes';
import { LiveStreaming, Stream as YTStream } from './YouTube/classes/LiveStream';

export async function stream(url: string, cookie?: string): Promise<YTStream | LiveStreaming | SoStream> {
    if (url.indexOf('soundcloud') !== -1) return await so_stream(url);
    else return await yt_stream(url, cookie);
}

export async function stream_from_info(
    info: InfoData | SoundCloudTrack,
    cookie?: string
): Promise<YTStream | LiveStreaming | SoStream> {
    if (info instanceof SoundCloudTrack) return await so_stream_info(info);
    else return await yt_stream_info(info, cookie);
}

export async function validate(url: string): Promise<"so_playlist" | "so_track" | "sp_track" | "sp_album" | "sp_playlist" | "yt_video" | "yt_playlist" | false> {
    let check;
    if (url.indexOf('spotify') !== -1) {
        check = sp_validate(url);
        return check !== false ? 'sp_' + check as "sp_track" | "sp_album" | "sp_playlist" : false;
    } else if (url.indexOf('soundcloud') !== -1) {
        check = await so_validate(url);
        return check !== false ? 'so_' + check as "so_playlist" | "so_track" : false;
    } else {
        check = yt_validate(url);
        return check !== false ? 'yt_' + check as "yt_video" | "yt_playlist" : false;
    }
}

export function authorization(): void {
    const ask = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    ask.question('Choose your service - so (for SoundCloud) / sp (for Spotify) : ', (msg) => {
        if (msg.toLowerCase().startsWith('sp')) {
            let client_id: string, client_secret: string, redirect_url: string, market: string;
            ask.question('Start by entering your Client ID : ', (id) => {
                client_id = id;
                ask.question('Now enter your Client Secret : ', (secret) => {
                    client_secret = secret;
                    ask.question('Enter your Redirect URL now : ', (url) => {
                        redirect_url = url;
                        console.log('\nIf you would like to know your region code visit : \nhttps://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements \n');
                        ask.question('Enter your region code (2-letter country code) : ', (mar) => {
                            if (mar.length === 2) market = mar;
                            else {
                                console.log('That doesn\'t look like a valid region code, IN will be selected as default.');
                                market = 'IN';
                            }
                            console.log(
                                '\nNow open your browser and paste the below url, then authorize it and copy the redirected url. \n'
                            );
                            console.log(
                                `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURI(
                                    redirect_url
                                )} \n`
                            );
                            ask.question('Paste the url which you just copied : ', async (url) => {
                                if (!fs.existsSync('.data')) fs.mkdirSync('.data');
                                const spotifyData = {
                                    client_id,
                                    client_secret,
                                    redirect_url,
                                    authorization_code: url.split('code=')[1],
                                    market
                                };
                                const check = await SpotifyAuthorize(spotifyData);
                                if (check === false) throw new Error('Failed to get access token.');
                                ask.close();
                            });
                        });
                    });
                });
            });
        } else if (msg.toLowerCase().startsWith('so')) {
            let client_id: string;
            ask.question('Client ID : ', async (id) => {
                client_id = id;
                if (!client_id) {
                    console.log("You didn't provide a client ID. Try again...");
                    ask.close();
                    return;
                }
                if (!fs.existsSync('.data')) fs.mkdirSync('.data');
                console.log('Validating your client ID, hold on...');
                if (await check_id(client_id)) {
                    console.log('Client ID has been validated successfully.');
                    fs.writeFileSync('.data/soundcloud.data', JSON.stringify({ client_id }, undefined, 4));
                } else console.log('That doesn\'t look like a valid client ID. Retry with a correct client ID.');
                ask.close();
            });
        } else {
            console.log('That option doesn\'t exist. Try again...');
            ask.close();
        }
    });
}
