import { request } from '../Request';
import { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack } from './classes';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

let spotifyData: SpotifyDataOptions;
if (existsSync('.data/spotify.data')) {
    spotifyData = JSON.parse(readFileSync('.data/spotify.data', 'utf-8'));
    spotifyData.file = true;
}
/**
 * Spotify Data options that are stored in spotify.data file.
 */
export interface SpotifyDataOptions {
    client_id: string;
    client_secret: string;
    redirect_url?: string;
    authorization_code?: string;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    expiry?: number;
    market?: string;
    file?: boolean;
}

const pattern = /^((https:)?\/\/)?open\.spotify\.com\/(?:intl\-.{2}\/)?(track|album|playlist)\//;
/**
 * Gets Spotify url details.
 *
 * ```ts
 * let spot = await play.spotify('spotify url')
 *
 * // spot.type === "track" | "playlist" | "album"
 *
 * if (spot.type === "track") {
 *      spot = spot as play.SpotifyTrack
 *      // Code with spotify track class.
 * }
 * ```
 * @param url Spotify Url
 * @returns A {@link SpotifyTrack} or {@link SpotifyPlaylist} or {@link SpotifyAlbum}
 */
export async function spotify(url: string): Promise<Spotify> {
    if (!spotifyData) throw new Error('Spotify Data is missing\nDid you forgot to do authorization ?');
    const url_ = url.trim();
    if (!url_.match(pattern)) throw new Error('This is not a Spotify URL');
    if (url_.indexOf('track/') !== -1) {
        const trackID = url_.split('track/')[1].split('&')[0].split('?')[0];
        const response = await request(`https://api.spotify.com/v1/tracks/${trackID}?market=${spotifyData.market}`, {
            headers: {
                Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
            }
        }).catch((err: Error) => {
            return err;
        });
        if (response instanceof Error) throw response;
        const resObj = JSON.parse(response);
        if (resObj.error) throw new Error(`Got ${resObj.error.status} from the spotify request: ${resObj.error.message}`);
        return new SpotifyTrack(resObj);
    } else if (url_.indexOf('album/') !== -1) {
        const albumID = url.split('album/')[1].split('&')[0].split('?')[0];
        const response = await request(`https://api.spotify.com/v1/albums/${albumID}?market=${spotifyData.market}`, {
            headers: {
                Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
            }
        }).catch((err: Error) => {
            return err;
        });
        if (response instanceof Error) throw response;
        const resObj = JSON.parse(response);
        if (resObj.error) throw new Error(`Got ${resObj.error.status} from the spotify request: ${resObj.error.message}`);
        return new SpotifyAlbum(resObj, spotifyData, false);
    } else if (url_.indexOf('playlist/') !== -1) {
        const playlistID = url.split('playlist/')[1].split('&')[0].split('?')[0];
        const response = await request(
            `https://api.spotify.com/v1/playlists/${playlistID}?market=${spotifyData.market}`,
            {
                headers: {
                    Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
                }
            }
        ).catch((err: Error) => {
            return err;
        });
        if (response instanceof Error) throw response;
        const resObj = JSON.parse(response);
        if (resObj.error) throw new Error(`Got ${resObj.error.status} from the spotify request: ${resObj.error.message}`);
        return new SpotifyPlaylist(resObj, spotifyData, false);
    } else throw new Error('URL is out of scope for play-dl.');
}
/**
 * Validate Spotify url
 * @param url Spotify URL
 * @returns
 * ```ts
 * 'track' | 'playlist' | 'album' | 'search' | false
 * ```
 */
export function sp_validate(url: string): 'track' | 'playlist' | 'album' | 'search' | false {
    const url_ = url.trim();
    if (!url_.startsWith('https')) return 'search';
    if (!url_.match(pattern)) return false;
    if (url_.indexOf('track/') !== -1) {
        return 'track';
    } else if (url_.indexOf('album/') !== -1) {
        return 'album';
    } else if (url_.indexOf('playlist/') !== -1) {
        return 'playlist';
    } else return false;
}
/**
 * Fuction for authorizing for spotify data.
 * @param data Sportify Data options to validate
 * @returns boolean.
 */
export async function SpotifyAuthorize(data: SpotifyDataOptions, file: boolean): Promise<boolean> {
    const response = await request(`https://accounts.spotify.com/api/token`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${data.client_id}:${data.client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code&code=${data.authorization_code}&redirect_uri=${encodeURI(
            data.redirect_url as string
        )}`,
        method: 'POST'
    }).catch((err: Error) => {
        return err;
    });
    if (response instanceof Error) throw response;
    const resp_json = JSON.parse(response);
    spotifyData = {
        client_id: data.client_id,
        client_secret: data.client_secret,
        redirect_url: data.redirect_url,
        access_token: resp_json.access_token,
        refresh_token: resp_json.refresh_token,
        expires_in: Number(resp_json.expires_in),
        expiry: Date.now() + (resp_json.expires_in - 1) * 1000,
        token_type: resp_json.token_type,
        market: data.market
    };
    if (file) writeFileSync('.data/spotify.data', JSON.stringify(spotifyData, undefined, 4));
    else {
        console.log(`Client ID : ${spotifyData.client_id}`);
        console.log(`Client Secret : ${spotifyData.client_secret}`);
        console.log(`Refresh Token : ${spotifyData.refresh_token}`);
        console.log(`Market : ${spotifyData.market}`);
        console.log(`\nPaste above info in setToken function.`);
    }
    return true;
}
/**
 * Checks if spotify token is expired or not.
 *
 * Update token if returned false.
 * ```ts
 * if (play.is_expired()) {
 *      await play.refreshToken()
 * }
 * ```
 * @returns boolean
 */
export function is_expired(): boolean {
    if (Date.now() >= (spotifyData.expiry as number)) return true;
    else return false;
}
/**
 * type for Spotify Classes
 */
export type Spotify = SpotifyAlbum | SpotifyPlaylist | SpotifyTrack;
/**
 * Function for searching songs on Spotify
 * @param query searching query
 * @param type "album" | "playlist" | "track"
 * @param limit max no of results
 * @returns Spotify type.
 */
export async function sp_search(
    query: string,
    type: 'album' | 'playlist' | 'track',
    limit: number = 10
): Promise<Spotify[]> {
    const results: Spotify[] = [];
    if (!spotifyData) throw new Error('Spotify Data is missing\nDid you forget to do authorization ?');
    if (query.length === 0) throw new Error('Pass some query to search.');
    if (limit > 50 || limit < 0) throw new Error(`You crossed limit range of Spotify [ 0 - 50 ]`);
    const response = await request(
        `https://api.spotify.com/v1/search?type=${type}&q=${query}&limit=${limit}&market=${spotifyData.market}`,
        {
            headers: {
                Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
            }
        }
    ).catch((err: Error) => {
        return err;
    });
    if (response instanceof Error) throw response;
    const json_data = JSON.parse(response);
    if (type === 'track') {
        json_data.tracks.items.forEach((track: any) => {
            results.push(new SpotifyTrack(track));
        });
    } else if (type === 'album') {
        json_data.albums.items.forEach((album: any) => {
            results.push(new SpotifyAlbum(album, spotifyData, true));
        });
    } else if (type === 'playlist') {
        json_data.playlists.items.forEach((playlist: any) => {
            results.push(new SpotifyPlaylist(playlist, spotifyData, true));
        });
    }
    return results;
}
/**
 * Refreshes Token
 *
 * ```ts
 * if (play.is_expired()) {
 *      await play.refreshToken()
 * }
 * ```
 * @returns boolean
 */
export async function refreshToken(): Promise<boolean> {
    const response = await request(`https://accounts.spotify.com/api/token`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${spotifyData.client_id}:${spotifyData.client_secret}`).toString(
                'base64'
            )}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${spotifyData.refresh_token}`,
        method: 'POST'
    }).catch((err: Error) => {
        return err;
    });
    if (response instanceof Error) return false;
    const resp_json = JSON.parse(response);
    spotifyData.access_token = resp_json.access_token;
    spotifyData.expires_in = Number(resp_json.expires_in);
    spotifyData.expiry = Date.now() + (resp_json.expires_in - 1) * 1000;
    spotifyData.token_type = resp_json.token_type;
    if (spotifyData.file) writeFileSync('.data/spotify.data', JSON.stringify(spotifyData, undefined, 4));
    return true;
}

export async function setSpotifyToken(options: SpotifyDataOptions) {
    spotifyData = options;
    spotifyData.file = false;
    await refreshToken();
}

export { SpotifyTrack, SpotifyAlbum, SpotifyPlaylist };
