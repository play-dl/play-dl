"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yt_validate = exports.video_info = exports.video_basic_info = exports.validate = exports.stream_from_info = exports.stream = exports.sp_validate = exports.spotify = exports.soundcloud = exports.so_validate = exports.setToken = exports.search = exports.refreshToken = exports.playlist_info = exports.is_expired = exports.getFreeClientID = exports.extractID = exports.dz_validate = exports.dz_advanced_track_search = exports.deezer = exports.decipher_info = exports.authorization = exports.attachListeners = exports.YouTubeVideo = exports.YouTubePlayList = exports.YouTubeChannel = exports.SpotifyTrack = exports.SpotifyPlaylist = exports.SpotifyAlbum = exports.SoundCloudTrack = exports.SoundCloudStream = exports.SoundCloudPlaylist = exports.DeezerTrack = exports.DeezerPlaylist = exports.DeezerAlbum = void 0;
const YouTube_1 = require("./YouTube");
Object.defineProperty(exports, "playlist_info", { enumerable: true, get: function () { return YouTube_1.playlist_info; } });
Object.defineProperty(exports, "video_basic_info", { enumerable: true, get: function () { return YouTube_1.video_basic_info; } });
Object.defineProperty(exports, "video_info", { enumerable: true, get: function () { return YouTube_1.video_info; } });
Object.defineProperty(exports, "decipher_info", { enumerable: true, get: function () { return YouTube_1.decipher_info; } });
Object.defineProperty(exports, "yt_validate", { enumerable: true, get: function () { return YouTube_1.yt_validate; } });
Object.defineProperty(exports, "extractID", { enumerable: true, get: function () { return YouTube_1.extractID; } });
Object.defineProperty(exports, "YouTubeChannel", { enumerable: true, get: function () { return YouTube_1.YouTubeChannel; } });
Object.defineProperty(exports, "YouTubePlayList", { enumerable: true, get: function () { return YouTube_1.YouTubePlayList; } });
Object.defineProperty(exports, "YouTubeVideo", { enumerable: true, get: function () { return YouTube_1.YouTubeVideo; } });
const Spotify_1 = require("./Spotify");
Object.defineProperty(exports, "spotify", { enumerable: true, get: function () { return Spotify_1.spotify; } });
Object.defineProperty(exports, "sp_validate", { enumerable: true, get: function () { return Spotify_1.sp_validate; } });
Object.defineProperty(exports, "refreshToken", { enumerable: true, get: function () { return Spotify_1.refreshToken; } });
Object.defineProperty(exports, "is_expired", { enumerable: true, get: function () { return Spotify_1.is_expired; } });
Object.defineProperty(exports, "SpotifyAlbum", { enumerable: true, get: function () { return Spotify_1.SpotifyAlbum; } });
Object.defineProperty(exports, "SpotifyPlaylist", { enumerable: true, get: function () { return Spotify_1.SpotifyPlaylist; } });
Object.defineProperty(exports, "SpotifyTrack", { enumerable: true, get: function () { return Spotify_1.SpotifyTrack; } });
const SoundCloud_1 = require("./SoundCloud");
Object.defineProperty(exports, "soundcloud", { enumerable: true, get: function () { return SoundCloud_1.soundcloud; } });
Object.defineProperty(exports, "so_validate", { enumerable: true, get: function () { return SoundCloud_1.so_validate; } });
Object.defineProperty(exports, "SoundCloudStream", { enumerable: true, get: function () { return SoundCloud_1.SoundCloudStream; } });
Object.defineProperty(exports, "getFreeClientID", { enumerable: true, get: function () { return SoundCloud_1.getFreeClientID; } });
Object.defineProperty(exports, "SoundCloudPlaylist", { enumerable: true, get: function () { return SoundCloud_1.SoundCloudPlaylist; } });
Object.defineProperty(exports, "SoundCloudTrack", { enumerable: true, get: function () { return SoundCloud_1.SoundCloudTrack; } });
const Deezer_1 = require("./Deezer");
Object.defineProperty(exports, "deezer", { enumerable: true, get: function () { return Deezer_1.deezer; } });
Object.defineProperty(exports, "dz_validate", { enumerable: true, get: function () { return Deezer_1.dz_validate; } });
Object.defineProperty(exports, "dz_advanced_track_search", { enumerable: true, get: function () { return Deezer_1.dz_advanced_track_search; } });
Object.defineProperty(exports, "DeezerTrack", { enumerable: true, get: function () { return Deezer_1.DeezerTrack; } });
Object.defineProperty(exports, "DeezerPlaylist", { enumerable: true, get: function () { return Deezer_1.DeezerPlaylist; } });
Object.defineProperty(exports, "DeezerAlbum", { enumerable: true, get: function () { return Deezer_1.DeezerAlbum; } });
const token_1 = require("./token");
Object.defineProperty(exports, "setToken", { enumerable: true, get: function () { return token_1.setToken; } });
var AudioPlayerStatus;
(function (AudioPlayerStatus) {
    AudioPlayerStatus["Idle"] = "idle";
    AudioPlayerStatus["Buffering"] = "buffering";
    AudioPlayerStatus["Paused"] = "paused";
    AudioPlayerStatus["Playing"] = "playing";
    AudioPlayerStatus["AutoPaused"] = "autopaused";
})(AudioPlayerStatus || (AudioPlayerStatus = {}));
const node_readline_1 = require("node:readline");
const node_fs_1 = require("node:fs");
const stream_1 = require("./YouTube/stream");
const search_1 = require("./YouTube/search");
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
async function stream(url, options = {}) {
    const url_ = url.trim();
    if (url_.length === 0)
        throw new Error('Stream URL has a length of 0. Check your url again.');
    if (options.htmldata)
        return await (0, stream_1.stream)(url_, options);
    if (url_.indexOf('spotify') !== -1) {
        throw new Error('Streaming from Spotify is not supported. Please use search() to find a similar track on YouTube or SoundCloud instead.');
    }
    if (url_.indexOf('deezer') !== -1) {
        throw new Error('Streaming from Deezer is not supported. Please use search() to find a similar track on YouTube or SoundCloud instead.');
    }
    if (url_.indexOf('soundcloud') !== -1)
        return await (0, SoundCloud_1.stream)(url_, options.quality);
    else
        return await (0, stream_1.stream)(url_, options);
}
exports.stream = stream;
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
async function search(query, options = {}) {
    if (!options.source)
        options.source = { youtube: 'video' };
    const query_ = encodeURIComponent(query.trim());
    if (options.source.youtube)
        return await (0, search_1.yt_search)(query_, {
            limit: options.limit,
            type: options.source.youtube,
            language: options.language,
            unblurNSFWThumbnails: options.unblurNSFWThumbnails
        });
    else if (options.source.spotify)
        return await (0, Spotify_1.sp_search)(query_, options.source.spotify, options.limit);
    else if (options.source.soundcloud)
        return await (0, SoundCloud_1.so_search)(query_, options.source.soundcloud, options.limit);
    else if (options.source.deezer)
        return await (0, Deezer_1.dz_search)(query_, { limit: options.limit, type: options.source.deezer, fuzzy: options.fuzzy });
    else
        throw new Error('Not possible to reach Here LOL. Easter Egg of play-dl if someone get this.');
}
exports.search = search;
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
async function stream_from_info(info, options = {}) {
    if (info instanceof SoundCloud_1.SoundCloudTrack)
        return await (0, SoundCloud_1.stream_from_info)(info, options.quality);
    else
        return await (0, stream_1.stream_from_info)(info, options);
}
exports.stream_from_info = stream_from_info;
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
async function validate(url) {
    let check;
    const url_ = url.trim();
    if (!url_.startsWith('https'))
        return 'search';
    if (url_.indexOf('spotify') !== -1) {
        check = (0, Spotify_1.sp_validate)(url_);
        return check !== false ? ('sp_' + check) : false;
    }
    else if (url_.indexOf('soundcloud') !== -1) {
        check = await (0, SoundCloud_1.so_validate)(url_);
        return check !== false ? ('so_' + check) : false;
    }
    else if (url_.indexOf('deezer') !== -1) {
        check = await (0, Deezer_1.dz_validate)(url_);
        return check !== false ? ('dz_' + check) : false;
    }
    else {
        check = (0, YouTube_1.yt_validate)(url_);
        return check !== false ? ('yt_' + check) : false;
    }
}
exports.validate = validate;
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
function authorization() {
    const ask = (0, node_readline_1.createInterface)({
        input: process.stdin,
        output: process.stdout
    });
    ask.question('Do you want to save data in a file ? (Yes / No): ', (msg) => {
        let file;
        if (msg.toLowerCase() === 'yes')
            file = true;
        else if (msg.toLowerCase() === 'no')
            file = false;
        else {
            console.log("That option doesn't exist. Try again...");
            ask.close();
            return;
        }
        ask.question('Choose your service - sc (for SoundCloud) / sp (for Spotify)  / yo (for YouTube): ', (msg) => {
            if (msg.toLowerCase().startsWith('sp')) {
                let client_id, client_secret, redirect_url, market, needUserData;
                ask.question('Do you require user specific information ? (Yes / No)', (needUser) => {
                    if (needUser.toLowerCase() === 'yes')
                        needUserData = true;
                    else if (needUser.toLowerCase() === 'no')
                        needUserData = false;
                    else {
                        console.log('That optio does not exist. Try again...');
                        ask.close();
                        return;
                    }
                    ask.question('Start by entering your Client ID : ', (id) => {
                        client_id = id;
                        ask.question('Now enter your Client Secret : ', (secret) => {
                            client_secret = secret;
                            ask.question('Enter your Redirect URL now : ', (url) => {
                                redirect_url = url;
                                console.log('\nIf you would like to know your region code visit : \nhttps://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements \n');
                                ask.question('Enter your region code (2-letter country code) : ', (mar) => {
                                    if (mar.length === 2)
                                        market = mar;
                                    else {
                                        console.log("That doesn't look like a valid region code, IN will be selected as default.");
                                        market = 'IN';
                                    }
                                    console.log('\nNow open your browser and paste the below url, then authorize it and copy the redirected url. \n');
                                    console.log(`https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURI(redirect_url)} \n`);
                                    ask.question('Paste the url which you just copied : ', async (url) => {
                                        if (!(0, node_fs_1.existsSync)('.data'))
                                            (0, node_fs_1.mkdirSync)('.data');
                                        const spotifyData = {
                                            client_id,
                                            client_secret,
                                            redirect_url,
                                            authorization_code: url.split('code=')[1],
                                            market
                                        };
                                        const check = await (0, Spotify_1.SpotifyAuthorize)(spotifyData, file, needUserData);
                                        if (check === false)
                                            throw new Error('Failed to get access token.');
                                        ask.close();
                                    });
                                });
                            });
                        });
                    });
                });
            }
            else if (msg.toLowerCase().startsWith('sc')) {
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
                    if (!(0, node_fs_1.existsSync)('.data'))
                        (0, node_fs_1.mkdirSync)('.data');
                    console.log('Validating your client ID, hold on...');
                    if (await (0, SoundCloud_1.check_id)(client_id)) {
                        console.log('Client ID has been validated successfully.');
                        (0, node_fs_1.writeFileSync)('.data/soundcloud.data', JSON.stringify({ client_id }, undefined, 4));
                    }
                    else
                        console.log("That doesn't look like a valid client ID. Retry with a correct client ID.");
                    ask.close();
                });
            }
            else if (msg.toLowerCase().startsWith('yo')) {
                if (!file) {
                    console.log('You already had cookie, just paste that in setToken function.');
                    ask.close();
                    return;
                }
                ask.question('Cookies : ', (cook) => {
                    if (!cook || cook.length === 0) {
                        console.log("You didn't provide a cookie. Try again...");
                        ask.close();
                        return;
                    }
                    if (!(0, node_fs_1.existsSync)('.data'))
                        (0, node_fs_1.mkdirSync)('.data');
                    console.log('Cookies has been added successfully.');
                    let cookie = {};
                    cook.split(';').forEach((x) => {
                        const arr = x.split('=');
                        if (arr.length <= 1)
                            return;
                        const key = arr.shift()?.trim();
                        const value = arr.join('=').trim();
                        Object.assign(cookie, { [key]: value });
                    });
                    (0, node_fs_1.writeFileSync)('.data/youtube.data', JSON.stringify({ cookie }, undefined, 4));
                    ask.close();
                });
            }
            else {
                console.log("That option doesn't exist. Try again...");
                ask.close();
            }
        });
    });
}
exports.authorization = authorization;
/**
 * Attaches paused, playing, autoPaused Listeners to discordjs voice AudioPlayer.
 *
 * Useful if you don't want extra data to be downloaded by play-dl.
 * @param player discordjs voice AudioPlayer
 * @param resource A {@link YouTubeStream} or {@link SoundCloudStream}
 */
function attachListeners(player, resource) {
    const listeners = player.listeners(AudioPlayerStatus.Idle);
    for (const cleanup of listeners) {
        if (cleanup.__playDlAttachedListener) {
            cleanup();
            player.removeListener(AudioPlayerStatus.Idle, cleanup);
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
exports.attachListeners = attachListeners;
// Export Default
exports.default = {
    DeezerAlbum: Deezer_1.DeezerAlbum,
    DeezerPlaylist: Deezer_1.DeezerPlaylist,
    DeezerTrack: Deezer_1.DeezerTrack,
    SoundCloudPlaylist: SoundCloud_1.SoundCloudPlaylist,
    SoundCloudStream: SoundCloud_1.SoundCloudStream,
    SoundCloudTrack: SoundCloud_1.SoundCloudTrack,
    SpotifyAlbum: Spotify_1.SpotifyAlbum,
    SpotifyPlaylist: Spotify_1.SpotifyPlaylist,
    SpotifyTrack: Spotify_1.SpotifyTrack,
    YouTubeChannel: YouTube_1.YouTubeChannel,
    YouTubePlayList: YouTube_1.YouTubePlayList,
    YouTubeVideo: YouTube_1.YouTubeVideo,
    attachListeners,
    authorization,
    decipher_info: YouTube_1.decipher_info,
    deezer: Deezer_1.deezer,
    dz_advanced_track_search: Deezer_1.dz_advanced_track_search,
    dz_validate: Deezer_1.dz_validate,
    extractID: YouTube_1.extractID,
    getFreeClientID: SoundCloud_1.getFreeClientID,
    is_expired: Spotify_1.is_expired,
    playlist_info: YouTube_1.playlist_info,
    refreshToken: Spotify_1.refreshToken,
    search,
    setToken: token_1.setToken,
    so_validate: SoundCloud_1.so_validate,
    soundcloud: SoundCloud_1.soundcloud,
    spotify: Spotify_1.spotify,
    sp_validate: Spotify_1.sp_validate,
    stream,
    stream_from_info,
    validate,
    video_basic_info: YouTube_1.video_basic_info,
    video_info: YouTube_1.video_info,
    yt_validate: YouTube_1.yt_validate
};
//# sourceMappingURL=index.js.map