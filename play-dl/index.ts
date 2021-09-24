export { playlist_info, video_basic_info, video_info, search, yt_validate, extractID } from './YouTube';
export { spotify, sp_validate, refreshToken, is_expired } from './Spotify';
export { soundcloud, so_validate } from './SoundCloud';

import readline from 'readline';
import fs from 'fs';
import { sp_validate, yt_validate, so_validate } from '.';
import { SpotifyAuthorize } from './Spotify';
import { check_id, stream as so_stream, stream_from_info as so_stream_info } from './SoundCloud';
import { InfoData, stream as yt_stream, StreamOptions, stream_from_info as yt_stream_info } from './YouTube/stream';
import { SoundCloudTrack, Stream as SoStream } from './SoundCloud/classes';
import { LiveStreaming, Stream as YTStream } from './YouTube/classes/LiveStream';

export async function stream(url: string, options: StreamOptions = {}): Promise<YTStream | LiveStreaming | SoStream> {
    if(url.length === 0) throw new Error('Stream URL has a length of 0. Check your url again.')
    if (url.indexOf('soundcloud') !== -1) return await so_stream(url, options.quality);
    else return await yt_stream(url, { cookie : options.cookie });
}

export async function stream_from_info(
    info: InfoData | SoundCloudTrack,
    options: StreamOptions = {}
): Promise<YTStream | LiveStreaming | SoStream> {
    if (info instanceof SoundCloudTrack) return await so_stream_info(info);
    else return await yt_stream_info(info, { cookie : options.cookie });
}

export async function validate(url: string): Promise<string | boolean> {
    if (url.indexOf('spotify') !== -1) {
        const check = sp_validate(url);
        if (check) {
            return 'sp_' + check;
        } else return check;
    } else if (url.indexOf('soundcloud') !== -1) {
        const check = await so_validate(url);
        if (check) {
            return 'so_' + check;
        } else return check;
    } else {
        const check = yt_validate(url);
        if (check) {
            return 'yt_' + check;
        } else return check;
    }
}

export function authorization(): void {
    const ask = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    ask.question('SoundCloud/ Spotify (so/sp) : ', (msg) => {
        if (msg.toLowerCase().startsWith('sp')) {
            let client_id: string, client_secret: string, redirect_url: string, market: string;
            ask.question('Client ID : ', (id) => {
                client_id = id;
                ask.question('Client Secret : ', (secret) => {
                    client_secret = secret;
                    ask.question('Redirect URL : ', (url) => {
                        redirect_url = url;
                        console.log(
                            '\nMarket Selection URL : \nhttps://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements \n'
                        );
                        ask.question('Market : ', (mar) => {
                            if (mar.length === 2) market = mar;
                            else {
                                console.log('Invalid Market, Selecting IN as market');
                                market = 'IN';
                            }
                            console.log(
                                '\nNow Go to your browser and Paste this url. Authroize it and paste the redirected url here. \n'
                            );
                            console.log(
                                `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURI(
                                    redirect_url
                                )} \n`
                            );
                            ask.question('Redirected URL : ', async (url) => {
                                if (!fs.existsSync('.data')) fs.mkdirSync('.data');
                                const spotifyData = {
                                    client_id,
                                    client_secret,
                                    redirect_url,
                                    authorization_code: url.split('code=')[1],
                                    market
                                };
                                const check = await SpotifyAuthorize(spotifyData);
                                if (check === false) throw new Error('Failed to get access Token.');
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
                    console.log("You didn't provided Client ID. Try again");
                    ask.close();
                    return;
                }
                if (!fs.existsSync('.data')) fs.mkdirSync('.data');
                console.log('Checking Client ID...................');
                if (await check_id(client_id)) {
                    console.log('Congratulations! Client ID is correct');
                    fs.writeFileSync('.data/soundcloud.data', JSON.stringify({ client_id }, undefined, 4));
                } else console.log('Client ID is incorrect. Try to run this again with correct client ID.');

                ask.close();
            });
        } else {
            console.log('Invalid Option, Please Try again');
            ask.close();
        }
    });
}
