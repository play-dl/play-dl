/// <reference types="node" />
import { playlist_info, video_basic_info, video_info, decipher_info, yt_validate, extractID, YouTube, YouTubeStream, YouTubeChannel, YouTubePlayList, YouTubeVideo, InfoData } from './YouTube';
import { spotify, sp_validate, refreshToken, is_expired, SpotifyAlbum, SpotifyPlaylist, SpotifyTrack, Spotify } from './Spotify';
import { soundcloud, so_validate, SoundCloud, SoundCloudStream, getFreeClientID, SoundCloudPlaylist, SoundCloudTrack } from './SoundCloud';
import { deezer, dz_validate, dz_advanced_track_search, Deezer, DeezerTrack, DeezerPlaylist, DeezerAlbum } from './Deezer';
import { setToken } from './token';
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
import { StreamOptions } from './YouTube/stream';
import { EventEmitter } from 'stream';
declare function stream(url: string, options: {
    seek?: number;
} & StreamOptions): Promise<YouTubeStream>;
declare function stream(url: string, options?: StreamOptions): Promise<YouTubeStream | SoundCloudStream>;
declare function search(query: string, options: {
    source: {
        deezer: 'album';
    };
} & SearchOptions): Promise<DeezerAlbum[]>;
declare function search(query: string, options: {
    source: {
        deezer: 'playlist';
    };
} & SearchOptions): Promise<DeezerPlaylist[]>;
declare function search(query: string, options: {
    source: {
        deezer: 'track';
    };
} & SearchOptions): Promise<DeezerTrack[]>;
declare function search(query: string, options: {
    source: {
        soundcloud: 'albums';
    };
} & SearchOptions): Promise<SoundCloudPlaylist[]>;
declare function search(query: string, options: {
    source: {
        soundcloud: 'playlists';
    };
} & SearchOptions): Promise<SoundCloudPlaylist[]>;
declare function search(query: string, options: {
    source: {
        soundcloud: 'tracks';
    };
} & SearchOptions): Promise<SoundCloudTrack[]>;
declare function search(query: string, options: {
    source: {
        spotify: 'album';
    };
} & SearchOptions): Promise<SpotifyAlbum[]>;
declare function search(query: string, options: {
    source: {
        spotify: 'playlist';
    };
} & SearchOptions): Promise<SpotifyPlaylist[]>;
declare function search(query: string, options: {
    source: {
        spotify: 'track';
    };
} & SearchOptions): Promise<SpotifyTrack[]>;
declare function search(query: string, options: {
    source: {
        youtube: 'channel';
    };
} & SearchOptions): Promise<YouTubeChannel[]>;
declare function search(query: string, options: {
    source: {
        youtube: 'playlist';
    };
} & SearchOptions): Promise<YouTubePlayList[]>;
declare function search(query: string, options: {
    source: {
        youtube: 'video';
    };
} & SearchOptions): Promise<YouTubeVideo[]>;
declare function search(query: string, options: {
    limit: number;
} & SearchOptions): Promise<YouTubeVideo[]>;
declare function search(query: string, options?: SearchOptions): Promise<YouTubeVideo[]>;
declare function stream_from_info(info: SoundCloudTrack, options?: StreamOptions): Promise<SoundCloudStream>;
declare function stream_from_info(info: InfoData, options?: StreamOptions): Promise<YouTubeStream>;
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
declare function validate(url: string): Promise<'so_playlist' | 'so_track' | 'sp_track' | 'sp_album' | 'sp_playlist' | 'dz_track' | 'dz_playlist' | 'dz_album' | 'yt_video' | 'yt_playlist' | 'search' | false>;
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
declare function authorization(): void;
/**
 * Attaches paused, playing, autoPaused Listeners to discordjs voice AudioPlayer.
 *
 * Useful if you don't want extra data to be downloaded by play-dl.
 * @param player discordjs voice AudioPlayer
 * @param resource A {@link YouTubeStream} or {@link SoundCloudStream}
 */
declare function attachListeners(player: EventEmitter, resource: YouTubeStream | SoundCloudStream): void;
export { DeezerAlbum, DeezerPlaylist, DeezerTrack, SoundCloudPlaylist, SoundCloudStream, SoundCloudTrack, SpotifyAlbum, SpotifyPlaylist, SpotifyTrack, YouTubeChannel, YouTubePlayList, YouTubeVideo, attachListeners, authorization, decipher_info, deezer, dz_advanced_track_search, dz_validate, extractID, getFreeClientID, is_expired, playlist_info, refreshToken, search, setToken, so_validate, soundcloud, spotify, sp_validate, stream, stream_from_info, validate, video_basic_info, video_info, yt_validate, InfoData };
export { Deezer, YouTube, SoundCloud, Spotify, YouTubeStream };
declare const _default: {
    DeezerAlbum: typeof DeezerAlbum;
    DeezerPlaylist: typeof DeezerPlaylist;
    DeezerTrack: typeof DeezerTrack;
    SoundCloudPlaylist: typeof SoundCloudPlaylist;
    SoundCloudStream: typeof SoundCloudStream;
    SoundCloudTrack: typeof SoundCloudTrack;
    SpotifyAlbum: typeof SpotifyAlbum;
    SpotifyPlaylist: typeof SpotifyPlaylist;
    SpotifyTrack: typeof SpotifyTrack;
    YouTubeChannel: typeof YouTubeChannel;
    YouTubePlayList: typeof YouTubePlayList;
    YouTubeVideo: typeof YouTubeVideo;
    attachListeners: typeof attachListeners;
    authorization: typeof authorization;
    decipher_info: typeof decipher_info;
    deezer: typeof deezer;
    dz_advanced_track_search: typeof dz_advanced_track_search;
    dz_validate: typeof dz_validate;
    extractID: typeof extractID;
    getFreeClientID: typeof getFreeClientID;
    is_expired: typeof is_expired;
    playlist_info: typeof playlist_info;
    refreshToken: typeof refreshToken;
    search: typeof search;
    setToken: typeof setToken;
    so_validate: typeof so_validate;
    soundcloud: typeof soundcloud;
    spotify: typeof spotify;
    sp_validate: typeof sp_validate;
    stream: typeof stream;
    stream_from_info: typeof stream_from_info;
    validate: typeof validate;
    video_basic_info: typeof video_basic_info;
    video_info: typeof video_info;
    yt_validate: typeof yt_validate;
};
export default _default;
//# sourceMappingURL=index.d.ts.map