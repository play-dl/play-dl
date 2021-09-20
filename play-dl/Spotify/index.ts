import { request } from '../YouTube/utils/request';
import { SpotifyAlbum, SpotifyPlaylist, SpotifyVideo } from './classes';
import fs from 'fs';

let spotifyData: SpotifyDataOptions;
if (fs.existsSync('.data/spotify.data')) {
    spotifyData = JSON.parse(fs.readFileSync('.data/spotify.data').toString());
}

export interface SpotifyDataOptions {
    client_id: string;
    client_secret: string;
    redirect_url: string;
    authorization_code?: string;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    expiry?: number;
    market?: string;
}

const pattern = /^((https:)?\/\/)?open.spotify.com\/(track|album|playlist)\//;

export async function spotify(url: string): Promise<SpotifyAlbum | SpotifyPlaylist | SpotifyVideo> {
    if (!spotifyData) throw new Error('Spotify Data is missing\nDid you forgot to do authorization ?');
    if (!url.match(pattern)) throw new Error('This is not a Spotify URL');
    if (url.indexOf('track/') !== -1) {
        const trackID = url.split('track/')[1].split('&')[0].split('?')[0];
        const response = await request(`https://api.spotify.com/v1/tracks/${trackID}?market=${spotifyData.market}`, {
            headers: {
                Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
            }
        }).catch((err: Error) => {
            return err;
        });
        if (response instanceof Error) throw response;
        return new SpotifyVideo(JSON.parse(response));
    } else if (url.indexOf('album/') !== -1) {
        const albumID = url.split('album/')[1].split('&')[0].split('?')[0];
        const response = await request(`https://api.spotify.com/v1/albums/${albumID}?market=${spotifyData.market}`, {
            headers: {
                Authorization: `${spotifyData.token_type} ${spotifyData.access_token}`
            }
        }).catch((err: Error) => {
            return err;
        });
        if (response instanceof Error) throw response;
        return new SpotifyAlbum(JSON.parse(response), spotifyData);
    } else if (url.indexOf('playlist/') !== -1) {
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
        return new SpotifyPlaylist(JSON.parse(response), spotifyData);
    } else throw new Error('URL is out of scope for play-dl.');
}

export function sp_validate(url: string): 'track' | 'playlist' | 'album' | false {
    if (!url.match(pattern)) return false;
    if (url.indexOf('track/') !== -1) {
        return 'track';
    } else if (url.indexOf('album/') !== -1) {
        return 'album';
    } else if (url.indexOf('playlist/') !== -1) {
        return 'playlist';
    } else return false;
}

export async function SpotifyAuthorize(data: SpotifyDataOptions): Promise<boolean> {
    const response = await request(`https://accounts.spotify.com/api/token`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${data.client_id}:${data.client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code&code=${data.authorization_code}&redirect_uri=${encodeURI(
            data.redirect_url
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
    fs.writeFileSync('.data/spotify.data', JSON.stringify(spotifyData, undefined, 4));
    return true;
}

export function is_expired(): boolean {
    if (Date.now() >= (spotifyData.expiry as number)) return true;
    else return false;
}

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
    fs.writeFileSync('.data/spotify.data', JSON.stringify(spotifyData, undefined, 4));
    return true;
}
