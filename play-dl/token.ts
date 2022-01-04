import { setUserAgent } from './Request/useragent';
import { setSoundCloudToken } from './SoundCloud';
import { setSpotifyToken } from './Spotify';
import { setCookieToken } from './YouTube/utils/cookie';

interface tokenOptions {
    spotify?: {
        client_id: string;
        client_secret: string;
        refresh_token: string;
        market: string;
    };
    soundcloud?: {
        client_id: string;
    };
    youtube?: {
        cookie: string;
    };
    useragent?: string[];
}
/**
 * Sets
 *
 *  i> YouTube :- cookies.
 *
 *  ii> SoundCloud :- client ID.
 *
 *  iii> Spotify :- client ID, client secret, refresh token, market.
 *
 *  iv> Useragents :- array of string.
 *
 * locally in memory.
 *
 * Example :
 * ```ts
 * play.setToken({
 *      youtube : {
 *          cookie : "Your Cookies"
 *      }
 * }) // YouTube Cookies
 *
 * await play.setToken({
 *      spotify : {
 *          client_id: 'ID',
            client_secret: 'secret',
            refresh_token: 'token',
            market: 'US'
 *      }
 * }) // Await this only when setting data for spotify
 * 
 * play.setToken({
 *      useragent: ['Your User-agent']
 * }) // Use this to avoid 429 errors.
 * ```
 * @param options {@link tokenOptions}
 */
export async function setToken(options: tokenOptions) {
    if (options.spotify) await setSpotifyToken(options.spotify);
    if (options.soundcloud) setSoundCloudToken(options.soundcloud);
    if (options.youtube) setCookieToken(options.youtube);
    if (options.useragent) setUserAgent(options.useragent);
}
