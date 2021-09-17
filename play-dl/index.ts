import readline from 'readline';

export {
    playlist_info,
    video_basic_info,
    video_info,
    search,
    stream,
    stream_from_info,
    yt_validate,
    extractID
} from './YouTube';

export { spotify, sp_validate, refreshToken, is_expired } from './Spotify';

export { soundcloud } from './SoundCloud';

import { sp_validate, yt_validate } from '.';
import { SpotifyAuthorize } from './Spotify';
import fs from 'fs';
import { check_id } from './SoundCloud';

export function validate(url: string): string | boolean {
    if (url.indexOf('spotify') !== -1) {
        const check = sp_validate(url);
        if (check) {
            return 'sp_' + check;
        } else return check;
    } else {
        const check = yt_validate(url);
        if (check) {
            return 'yt_' + check;
        } else return check;
    }
}

export function authorization() {
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
