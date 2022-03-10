import {
    playlist_info,
    video_basic_info,
    video_info,
    decipher_info,
    yt_validate,
    extractID,
    YouTube,
    YouTubeStream,
    YouTubeChannel,
    YouTubePlayList,
    YouTubeVideo,
    InfoData
} from './YouTube';
import {
    spotify,
    sp_validate,
    refreshToken,
    is_expired,
    SpotifyAlbum,
    SpotifyPlaylist,
    SpotifyTrack,
    Spotify,
    SpotifyAuthorize,
    sp_search
} from './Spotify';
import {
    soundcloud,
    so_validate,
    SoundCloud,
    SoundCloudStream,
    getFreeClientID,
    SoundCloudPlaylist,
    SoundCloudTrack,
    check_id,
    so_search,
    stream as so_stream,
    stream_from_info as so_stream_info
} from './SoundCloud';
import {
    deezer,
    dz_validate,
    dz_advanced_track_search,
    Deezer,
    DeezerTrack,
    DeezerPlaylist,
    DeezerAlbum,
    dz_search
} from './Deezer';
import { setToken } from './token';

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
        deezer?: 'track' | 'playlist' | 'album';
    };
    fuzzy?: boolean;
    language?: string;
    /**
     * !!! Before enabling this for public servers, please consider using Discord features like NSFW channels as not everyone in your server wants to see NSFW images. !!!
     * Unblurred images will likely have different dimensions than specified in the {@link YouTubeThumbnail} objects.
     */
    unblurNSFWThumbnails?: boolean;
}

import { createInterface } from 'node:readline';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { stream as yt_stream, StreamOptions, stream_from_info as yt_stream_info } from './YouTube/stream';
import { yt_search } from './YouTube/search';
import { EventEmitter } from 'stream';

async function stream(url: string, options: { seek?: number } & StreamOptions): Promise<YouTubeStream>;
async function stream(url: string, options?: StreamOptions): Promise<YouTubeStream | SoundCloudStream>;
/**
 * Creates a Stream [ YouTube or SoundCloud ] class from a url for playing.
 *
 * Example
 * ```ts
 * const source = await play.stream('youtube video URL') // YouTube Video Stream
 *
 * const source = await play.stream('soundcloud track URL') // SoundCloud Track Stream
 *
 * const source = await play.stream('youtube video URL', { seek : 45 }) // Seeks 45 seconds (approx.) in YouTube Video Stream
 *
 * const resource = createAudioResource(source.stream, {
 *      inputType : source.type
 * }) // Use discordjs voice createAudioResource function.
 * ```
 * @param url Video / Track URL
 * @param options
 *
 *  - `number` seek : No of seconds to seek in stream.
 *  - `string` language : Sets language of searched content [ YouTube search only. ], e.g. "en-US"
 *  - `number` quality : Quality number. [ 0 = Lowest, 1 = Medium, 2 = Highest ]
 *  - `boolean` htmldata : given data is html data or not
 *  - `number` precache : No of segments of data to store before looping [YouTube Live Stream only]. [ Defaults to 3 ]
 *  - `boolean` discordPlayerCompatibility : Conversion of Webm to Opus [ Defaults to false ]
 * @returns A {@link YouTubeStream} or {@link SoundCloudStream} Stream to play
 */
async function stream(url: string, options: StreamOptions = {}): Promise<YouTubeStream | SoundCloudStream> {
    const url_ = url.trim();
    if (url_.length === 0) throw new Error('Stream URL has a length of 0. Check your url again.');
    if (options.htmldata) return await yt_stream(url_, options);
    if (url_.indexOf('spotify') !== -1) {
        throw new Error(
            'Streaming from Spotify is not supported. Please use search() to find a similar track on YouTube or SoundCloud instead.'
        );
    }
    if (url_.indexOf('deezer') !== -1) {
        throw new Error(
            'Streaming from Deezer is not supported. Please use search() to find a similar track on YouTube or SoundCloud instead.'
        );
    }
    if (url_.indexOf('soundcloud') !== -1) return await so_stream(url_, options.quality);
    else return await yt_stream(url_, options);
}

async function search(query: string, options: { source: { deezer: 'album' } } & SearchOptions): Promise<DeezerAlbum[]>;
async function search(
    query: string,
    options: { source: { deezer: 'playlist' } } & SearchOptions
): Promise<DeezerPlaylist[]>;
async function search(query: string, options: { source: { deezer: 'track' } } & SearchOptions): Promise<DeezerTrack[]>;
async function search(
    query: string,
    options: { source: { soundcloud: 'albums' } } & SearchOptions
): Promise<SoundCloudPlaylist[]>;
async function search(
    query: string,
    options: { source: { soundcloud: 'playlists' } } & SearchOptions
): Promise<SoundCloudPlaylist[]>;
async function search(
    query: string,
    options: { source: { soundcloud: 'tracks' } } & SearchOptions
): Promise<SoundCloudTrack[]>;
async function search(
    query: string,
    options: { source: { spotify: 'album' } } & SearchOptions
): Promise<SpotifyAlbum[]>;
async function search(
    query: string,
    options: { source: { spotify: 'playlist' } } & SearchOptions
): Promise<SpotifyPlaylist[]>;
async function search(
    query: string,
    options: { source: { spotify: 'track' } } & SearchOptions
): Promise<SpotifyTrack[]>;
async function search(
    query: string,
    options: { source: { youtube: 'channel' } } & SearchOptions
): Promise<YouTubeChannel[]>;
async function search(
    query: string,
    options: { source: { youtube: 'playlist' } } & SearchOptions
): Promise<YouTubePlayList[]>;
async function search(
    query: string,
    options: { source: { youtube: 'video' } } & SearchOptions
): Promise<YouTubeVideo[]>;
async function search(query: string, options: { limit: number } & SearchOptions): Promise<YouTubeVideo[]>;
async function search(query: string, options?: SearchOptions): Promise<YouTubeVideo[]>;
/**
 * Searches through a particular source and gives respective info.
 * 
 * Example
 * ```ts
 * const searched = await play.search('Rick Roll', { source : { youtube : "video" } }) // YouTube Video Search
 * 
 * const searched = await play.search('Rick Roll', { limit : 1 }) // YouTube Video Search but returns only 1 video.
 * 
 * const searched = await play.search('Rick Roll', { source : { spotify : "track" } }) // Spotify Track Search
 * 
 * const searched = await play.search('Rick Roll', { source : { soundcloud : "tracks" } }) // SoundCloud Track Search
 * 
 * const searched = await play.search('Rick Roll', { source : { deezer : "track" } }) // Deezer Track Search
 * ```
 * @param query string to search.
 * @param options
 * 
 *  - `number` limit : No of searches you want to have.
 *  - `string` language : Sets language of searched content [ YouTube search only. ], e.g. "en-US"
 *  - `boolean` unblurNSFWThumbnails : Unblurs NSFW thumbnails. Defaults to `false` [ YouTube search only. ]
 *              !!! Before enabling this for public servers, please consider using Discord features like NSFW channels as not everyone in your server wants to see NSFW images. !!!
 *              Unblurred images will likely have different dimensions than specified in the {@link YouTubeThumbnail} objects.
 *  - `boolean` fuzzy : Whether the search should be fuzzy or only return exact matches. Defaults to `true`. [ for `Deezer` Only ]
 *  - `Object` source : Contains type of source and type of result you want to have
 * ```ts
 *      - youtube : 'video' | 'playlist' | 'channel';
        - spotify : 'album' | 'playlist' | 'track';
        - soundcloud : 'tracks' | 'playlists' | 'albums';
        - deezer : 'track' | 'playlist' | 'album';
    ```
 * @returns Array of {@link YouTube} or {@link Spotify} or {@link SoundCloud} or {@link Deezer} type
 */
async function search(
    query: string,
    options: SearchOptions = {}
): Promise<YouTube[] | Spotify[] | SoundCloud[] | Deezer[]> {
    if (!options.source) options.source = { youtube: 'video' };
    const query_ = encodeURIComponent(query.trim());
    if (options.source.youtube)
        return await yt_search(query_, {
            limit: options.limit,
            type: options.source.youtube,
            language: options.language,
            unblurNSFWThumbnails: options.unblurNSFWThumbnails
        });
    else if (options.source.spotify) return await sp_search(query_, options.source.spotify, options.limit);
    else if (options.source.soundcloud) return await so_search(query_, options.source.soundcloud, options.limit);
    else if (options.source.deezer)
        return await dz_search(query_, { limit: options.limit, type: options.source.deezer, fuzzy: options.fuzzy });
    else throw new Error('Not possible to reach Here LOL. Easter Egg of play-dl if someone get this.');
}

async function stream_from_info(info: SoundCloudTrack, options?: StreamOptions): Promise<SoundCloudStream>;
async function stream_from_info(info: InfoData, options?: StreamOptions): Promise<YouTubeStream>;
/**
 * Creates a Stream [ YouTube or SoundCloud ] class from video or track info for playing.
 *
 * Example
 * ```ts
 * const info = await video_info('youtube URL')
 * const source = await play.stream_from_info(info) // YouTube Video Stream
 *
 * const soundInfo = await play.soundcloud('SoundCloud URL')
 * const source = await play.stream_from_info(soundInfo) // SoundCloud Track Stream
 *
 * const source = await play.stream_from_info(info, { seek : 45 }) // Seeks 45 seconds (approx.) in YouTube Video Stream
 *
 * const resource = createAudioResource(source.stream, {
 *      inputType : source.type
 * }) // Use discordjs voice createAudioResource function.
 * ```
 * @param info YouTube video info OR SoundCloud track Class
 * @param options
 *
 *  - `number` seek : No of seconds to seek in stream.
 *  - `string` language : Sets language of searched content [ YouTube search only. ], e.g. "en-US"
 *  - `number` quality : Quality number. [ 0 = Lowest, 1 = Medium, 2 = Highest ]
 *  - `boolean` htmldata : given data is html data or not
 *  - `number` precache : No of segments of data to store before looping [YouTube Live Stream only]. [ Defaults to 3 ]
 *  - `boolean` discordPlayerCompatibility : Conversion of Webm to Opus[ Defaults to false ]
 * @returns A {@link YouTubeStream} or {@link SoundCloudStream} Stream to play
 */
async function stream_from_info(
    info: InfoData | SoundCloudTrack,
    options: StreamOptions = {}
): Promise<YouTubeStream | SoundCloudStream> {
    if (info instanceof SoundCloudTrack) return await so_stream_info(info, options.quality);
    else return await yt_stream_info(info, options);
}
/**
 * Validates url that play-dl supports.
 *
 * - `so` - SoundCloud
 * - `sp` - Spotify
 * - `dz` - Deezer
 * - `yt` - YouTube
 * @param url URL
 * @returns
 * ```ts
 * 'so_playlist' / 'so_track' | 'sp_track' | 'sp_album' | 'sp_playlist' | 'dz_track' | 'dz_playlist' | 'dz_album' | 'yt_video' | 'yt_playlist' | 'search' | false
 * ```
 */
async function validate(
    url: string
): Promise<
    | 'so_playlist'
    | 'so_track'
    | 'sp_track'
    | 'sp_album'
    | 'sp_playlist'
    | 'dz_track'
    | 'dz_playlist'
    | 'dz_album'
    | 'yt_video'
    | 'yt_playlist'
    | 'search'
    | false
> {
    let check;
    const url_ = url.trim();
    if (!url_.startsWith('https')) return 'search';
    if (url_.indexOf('spotify') !== -1) {
        check = sp_validate(url_);
        return check !== false ? (('sp_' + check) as 'sp_track' | 'sp_album' | 'sp_playlist') : false;
    } else if (url_.indexOf('soundcloud') !== -1) {
        check = await so_validate(url_);
        return check !== false ? (('so_' + check) as 'so_playlist' | 'so_track') : false;
    } else if (url_.indexOf('deezer') !== -1) {
        check = await dz_validate(url_);
        return check !== false ? (('dz_' + check) as 'dz_track' | 'dz_playlist' | 'dz_album') : false;
    } else {
        check = yt_validate(url_);
        return check !== false ? (('yt_' + check) as 'yt_video' | 'yt_playlist') : false;
    }
}
/**
 * Authorization interface for Spotify, SoundCloud and YouTube.
 *
 * Either stores info in `.data` folder or shows relevant data to be used in `setToken` function.
 *
 * ```ts
 * const play = require('play-dl')
 *
 * play.authorization()
 * ```
 *
 * Just run the above command and you will get a interface asking some questions.
 */
function authorization(): void {
    const ask = createInterface({
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
                                    if (!existsSync('.data')) mkdirSync('.data');
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
                    if (!existsSync('.data')) mkdirSync('.data');
                    console.log('Validating your client ID, hold on...');
                    if (await check_id(client_id)) {
                        console.log('Client ID has been validated successfully.');
                        writeFileSync('.data/soundcloud.data', JSON.stringify({ client_id }, undefined, 4));
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
                    if (!existsSync('.data')) mkdirSync('.data');
                    console.log('Cookies has been added successfully.');
                    let cookie: Object = {};
                    cook.split(';').forEach((x) => {
                        const arr = x.split('=');
                        if (arr.length <= 1) return;
                        const key = arr.shift()?.trim() as string;
                        const value = arr.join('=').trim();
                        Object.assign(cookie, { [key]: value });
                    });
                    writeFileSync('.data/youtube.data', JSON.stringify({ cookie }, undefined, 4));
                    ask.close();
                });
            } else {
                console.log("That option doesn't exist. Try again...");
                ask.close();
            }
        });
    });
}
/**
 * Attaches paused, playing, autoPaused Listeners to discordjs voice AudioPlayer.
 *
 * Useful if you don't want extra data to be downloaded by play-dl.
 * @param player discordjs voice AudioPlayer
 * @param resource A {@link YouTubeStream} or {@link SoundCloudStream}
 */
function attachListeners(player: EventEmitter, resource: YouTubeStream | SoundCloudStream) {
    // cleanup existing listeners if they are still registered
    type listenerType = (...args: any[]) => void;

    const listeners = player.listeners(AudioPlayerStatus.Idle);
    for (const cleanup of listeners) {
        if ((cleanup as any).__playDlAttachedListener) {
            cleanup();
            player.removeListener(AudioPlayerStatus.Idle, cleanup as listenerType);
        }
    }

    const pauseListener = () => resource.pause();
    const resumeListener = () => resource.resume();
    const idleListener = () => {
        player.removeListener(AudioPlayerStatus.Paused, pauseListener);
        player.removeListener(AudioPlayerStatus.AutoPaused, pauseListener);
        player.removeListener(AudioPlayerStatus.Playing, resumeListener);
    };
    pauseListener.__playDlAttachedListener = true;
    resumeListener.__playDlAttachedListener = true;
    idleListener.__playDlAttachedListener = true;
    player.on(AudioPlayerStatus.Paused, pauseListener);
    player.on(AudioPlayerStatus.AutoPaused, pauseListener);
    player.on(AudioPlayerStatus.Playing, resumeListener);
    player.once(AudioPlayerStatus.Idle, idleListener);
}

// Export Main Commands
export {
    DeezerAlbum,
    DeezerPlaylist,
    DeezerTrack,
    SoundCloudPlaylist,
    SoundCloudStream,
    SoundCloudTrack,
    SpotifyAlbum,
    SpotifyPlaylist,
    SpotifyTrack,
    YouTubeChannel,
    YouTubePlayList,
    YouTubeVideo,
    attachListeners,
    authorization,
    decipher_info,
    deezer,
    dz_advanced_track_search,
    dz_validate,
    extractID,
    getFreeClientID,
    is_expired,
    playlist_info,
    refreshToken,
    search,
    setToken,
    so_validate,
    soundcloud,
    spotify,
    sp_validate,
    stream,
    stream_from_info,
    validate,
    video_basic_info,
    video_info,
    yt_validate,
    InfoData
};

// Export Types
export { Deezer, YouTube, SoundCloud, Spotify, YouTubeStream };

// Export Default
export default {
    DeezerAlbum,
    DeezerPlaylist,
    DeezerTrack,
    SoundCloudPlaylist,
    SoundCloudStream,
    SoundCloudTrack,
    SpotifyAlbum,
    SpotifyPlaylist,
    SpotifyTrack,
    YouTubeChannel,
    YouTubePlayList,
    YouTubeVideo,
    attachListeners,
    authorization,
    decipher_info,
    deezer,
    dz_advanced_track_search,
    dz_validate,
    extractID,
    getFreeClientID,
    is_expired,
    playlist_info,
    refreshToken,
    search,
    setToken,
    so_validate,
    soundcloud,
    spotify,
    sp_validate,
    stream,
    stream_from_info,
    validate,
    video_basic_info,
    video_info,
    yt_validate
};
