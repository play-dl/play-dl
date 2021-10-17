export {
    playlist_info,
    video_basic_info,
    video_info,
    decipher_info,
    yt_validate,
    extractID,
    YouTube,
    YouTubeStream
} from './YouTube';
export { spotify, sp_validate, refreshToken, is_expired, Spotify } from './Spotify';
export { soundcloud, so_validate, SoundCloud, SoundCloudStream } from './SoundCloud';
export { setToken } from './token';

enum AudioPlayerStatus {
    Idle = 'idle',
    Buffering = 'buffering',
    Paused = 'paused',
    Playing = 'playing',
    AutoPaused = 'autopaused'
}

interface SearchOptions {
    limit?: number;
    source?: {
        youtube?: 'video' | 'playlist' | 'channel';
        spotify?: 'album' | 'playlist' | 'track';
        soundcloud?: 'tracks' | 'playlists' | 'albums';
    };
}

import readline from 'readline';
import fs from 'fs';
import {
    sp_validate,
    yt_validate,
    so_validate,
    YouTubeStream,
    SoundCloudStream,
    YouTube,
    SoundCloud,
    Spotify
} from '.';
import { SpotifyAuthorize, sp_search } from './Spotify';
import { check_id, so_search, stream as so_stream, stream_from_info as so_stream_info } from './SoundCloud';
import { InfoData, stream as yt_stream, StreamOptions, stream_from_info as yt_stream_info } from './YouTube/stream';
import { SoundCloudTrack } from './SoundCloud/classes';
import { yt_search } from './YouTube/search';
import { EventEmitter } from 'stream';

/**
 * Main stream Command for streaming through various sources
 * @param url The video / track url to make stream of
 * @param options contains quality, cookie and proxy to set for stream
 * @returns YouTube / SoundCloud Stream to play
 */

export async function stream(url: string, options: StreamOptions = {}): Promise<YouTubeStream | SoundCloudStream> {
    if (url.length === 0) throw new Error('Stream URL has a length of 0. Check your url again.');
    if (url.indexOf('spotify') !== -1) {
        throw new Error(
            'Streaming from Spotify is not supported. Please use search() to find a similar track on YouTube or SoundCloud instead.'
        );
    }
    if (url.indexOf('soundcloud') !== -1) return await so_stream(url, options.quality);
    else return await yt_stream(url, options);
}

/**
 *  Main Search Command for searching through various sources
 * @param query string to search.
 * @param options contains limit and source to choose.
 * @returns Array of YouTube or Spotify or SoundCloud
 */
export async function search(
    query: string,
    options: SearchOptions = {}
): Promise<YouTube[] | Spotify[] | SoundCloud[]> {
    if (!options.source) options.source = { youtube: 'video' };

    if (options.source.youtube) return await yt_search(query, { limit: options.limit, type: options.source.youtube });
    else if (options.source.spotify) return await sp_search(query, options.source.spotify, options.limit);
    else if (options.source.soundcloud) return await so_search(query, options.source.soundcloud, options.limit);
    else throw new Error('Not possible to reach Here LOL. Easter Egg of play-dl if someone get this.');
}

/**
 *  stream Command for streaming through various sources using data from video_info or soundcloud
 *  SoundCloud Track is only supported
 * @param info video_info data or SoundCloud Track data.
 * @param options contains quality, cookie and proxy to set for stream
 * @returns YouTube / SoundCloud Stream to play
 */
export async function stream_from_info(
    info: InfoData | SoundCloudTrack,
    options: StreamOptions = {}
): Promise<YouTubeStream | SoundCloudStream> {
    if (info instanceof SoundCloudTrack) return await so_stream_info(info, options.quality);
    else return await yt_stream_info(info, options);
}
/**
 * Command to validate the provided url. It checks whether it supports play-dl or not.
 * @param url url to validate
 * @returns On failure, returns false else type of url.
 */
export async function validate(
    url: string
): Promise<
    'so_playlist' | 'so_track' | 'sp_track' | 'sp_album' | 'sp_playlist' | 'yt_video' | 'yt_playlist' | 'search' | false
> {
    let check;
    if (!url.startsWith('https')) return 'search';
    if (url.indexOf('spotify') !== -1) {
        check = sp_validate(url);
        return check !== false ? (('sp_' + check) as 'sp_track' | 'sp_album' | 'sp_playlist') : false;
    } else if (url.indexOf('soundcloud') !== -1) {
        check = await so_validate(url);
        return check !== false ? (('so_' + check) as 'so_playlist' | 'so_track') : false;
    } else {
        check = yt_validate(url);
        return check !== false ? (('yt_' + check) as 'yt_video' | 'yt_playlist') : false;
    }
}
/**
 * Authorization interface for Spotify and SoundCloud.
 */
export function authorization(): void {
    const ask = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    ask.question('Do you want to save data in a file ? (Yes / No): ', (msg) => {
        let file: boolean;
        if (msg.toLowerCase() === 'yes') file = true;
        else if (msg.toLowerCase() === 'no') file = false;
        else {
            console.log("That option doesn't exist. Try again...");
            ask.close();
            return;
        }
        ask.question('Choose your service - sc (for SoundCloud) / sp (for Spotify)  / yo (for YouTube): ', (msg) => {
            if (msg.toLowerCase().startsWith('sp')) {
                let client_id: string, client_secret: string, redirect_url: string, market: string;
                ask.question('Start by entering your Client ID : ', (id) => {
                    client_id = id;
                    ask.question('Now enter your Client Secret : ', (secret) => {
                        client_secret = secret;
                        ask.question('Enter your Redirect URL now : ', (url) => {
                            redirect_url = url;
                            console.log(
                                '\nIf you would like to know your region code visit : \nhttps://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements \n'
                            );
                            ask.question('Enter your region code (2-letter country code) : ', (mar) => {
                                if (mar.length === 2) market = mar;
                                else {
                                    console.log(
                                        "That doesn't look like a valid region code, IN will be selected as default."
                                    );
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
                                    const check = await SpotifyAuthorize(spotifyData, file);
                                    if (check === false) throw new Error('Failed to get access token.');
                                    ask.close();
                                });
                            });
                        });
                    });
                });
            } else if (msg.toLowerCase().startsWith('sc')) {
                if (!file) {
                    console.log('You already had a client ID, just paste that in setToken function.');
                    ask.close();
                    return;
                }
                ask.question('Client ID : ', async (id) => {
                    let client_id = id;
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
                    } else console.log("That doesn't look like a valid client ID. Retry with a correct client ID.");
                    ask.close();
                });
            } else if (msg.toLowerCase().startsWith('yo')) {
                if (!file) {
                    console.log('You already had cookie, just paste that in setToken function.');
                    ask.close();
                    return;
                }
                ask.question('Cookies : ', (cook: string) => {
                    if (!cook || cook.length === 0) {
                        console.log("You didn't provide a cookie. Try again...");
                        ask.close();
                        return;
                    }
                    if (!fs.existsSync('.data')) fs.mkdirSync('.data');
                    console.log('Cookies has been added successfully.');
                    let cookie: Object = {};
                    cook.split(';').forEach((x) => {
                        const arr = x.split('=');
                        if (arr.length <= 1) return;
                        const key = arr.shift()?.trim() as string;
                        const value = arr.join('=').trim();
                        Object.assign(cookie, { [key]: value });
                    });
                    fs.writeFileSync('.data/youtube.data', JSON.stringify({ cookie }, undefined, 4));
                    ask.close();
                });
            } else {
                console.log("That option doesn't exist. Try again...");
                ask.close();
            }
        });
    });
}

export function attachListeners(player: EventEmitter, resource: YouTubeStream | SoundCloudStream) {
    const pauseListener = () => resource.pause();
    const resumeListener = () => resource.resume();
    player.on(AudioPlayerStatus.Paused, pauseListener);
    player.on(AudioPlayerStatus.AutoPaused, pauseListener);
    player.on(AudioPlayerStatus.Playing, resumeListener);
    player.once(AudioPlayerStatus.Idle, () => {
        player.removeListener(AudioPlayerStatus.Paused, pauseListener);
        player.removeListener(AudioPlayerStatus.AutoPaused, pauseListener);
        player.removeListener(AudioPlayerStatus.Playing, resumeListener);
    });
}
