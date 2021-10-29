import { URL } from 'url';
import { request, request_resolve_redirect } from '../Request';
import { DeezerAlbum, DeezerPlaylist, DeezerTrack } from './classes';

interface TypeData {
    type: 'track' | 'playlist' | 'album' | 'search' | 'share' | false;
    id?: string;
}

interface DeezerSearchOptions {
    type?: 'track' | 'playlist' | 'album';
    limit?: number;
    fuzzy?: boolean;
}

function internalValidate(url: string): TypeData {
    let urlObj;
    try {
        // will throw a TypeError if the input is not a valid URL so we need to catch it
        urlObj = new URL(url);
    } catch {
        return { type: 'search' };
    }

    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
        return { type: 'search' };
    }

    let pathname = urlObj.pathname;
    if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }
    const path = pathname.split('/');
    switch (urlObj.hostname) {
        case 'deezer.com':
        case 'www.deezer.com': {
            if (path.length === 4) {
                const lang = path.splice(1, 1)[0];
                if (!lang.match(/^[a-z]{2}$/)) {
                    return { type: false };
                }
            } else if (path.length !== 3) {
                return { type: false };
            }

            if ((path[1] === 'track' || path[1] === 'album' || path[1] === 'playlist') && path[2].match(/^[0-9]+$/)) {
                return {
                    type: path[1],
                    id: path[2]
                };
            } else {
                return { type: false };
            }
        }
        case 'api.deezer.com': {
            if (
                path.length === 3 &&
                (path[1] === 'track' || path[1] === 'album' || path[1] === 'playlist') &&
                path[2].match(/^[0-9]+$/)
            ) {
                return {
                    type: path[1],
                    id: path[2]
                };
            } else {
                return { type: false };
            }
        }
        case 'deezer.page.link': {
            if (path.length === 2 && path[1].match(/^[A-Za-z0-9]+$/)) {
                return { type: 'share' };
            } else {
                return { type: false };
            }
        }
        default:
            return { type: 'search' };
    }
}

/**
 * Shared type for Deezer tracks, playlists and albums
 */
export type Deezer = DeezerTrack | DeezerPlaylist | DeezerAlbum;

/**
 * Fetches the information for a track, playlist or album on Deezer
 * @param url The track, playlist or album URL
 * @returns A {@link DeezerTrack}, {@link DeezerPlaylist} or {@link DeezerAlbum}
 * object depending on the provided URL.
 */
export async function deezer(url: string): Promise<Deezer> {
    const typeData = internalValidate(url);

    if (!typeData.type || typeData.type === 'search')
        throw new Error('This is not a Deezer track, playlist or album URL');

    if (typeData.type === 'share') {
        const resolvedURL = await internalResolve(url);
        return await deezer(resolvedURL);
    }

    const response = await request(`https://api.deezer.com/${typeData.type}/${typeData.id}`).catch((err: Error) => err);

    if (response instanceof Error) throw response;

    const jsonData = JSON.parse(response);

    if (jsonData.error) {
        throw new Error(`Deezer API Error: ${jsonData.error.type}: ${jsonData.error.message}`);
    }

    switch (typeData.type) {
        case 'track':
            return new DeezerTrack(jsonData, false);
        case 'playlist':
            return new DeezerPlaylist(jsonData, false);
        case 'album':
            return new DeezerAlbum(jsonData, false);
    }
}

/**
 * Validates a Deezer URL
 * @param url The URL to validate
 * @returns The type of the URL either 'track', 'playlist', 'album', 'search', 'share' or false.
 * false means that the provided URL was a wrongly formatted or unsupported Deezer URL.
 */
export function dz_validate(url: string): 'track' | 'playlist' | 'album' | 'search' | 'share' | false {
    return internalValidate(url).type;
}

/**
 * Searches Deezer for tracks, playlists or albums
 * @param query The search query
 * @param options Extra options to configure the search:
 *
 * type?: The type to search for `'track'`, `'playlist'` or `'album'`. Defaults to `'track'`.
 *
 * limit?: The maximum number of results to return, maximum `100`, defaults to `10`.
 *
 * fuzzy?: Whether the search should be fuzzy or only return exact matches. Defaults to `true`.
 * @returns An array of tracks, playlists or albums
 */
export async function dz_search(query: string, options: DeezerSearchOptions): Promise<Deezer[]> {
    let query_ = query.trim();

    const type = options.type ?? 'track';
    const limit = options.limit ?? 10;
    const fuzzy = options.fuzzy ?? true;

    if (query_.length === 0) throw new Error('A query is required to search.');
    if (limit > 100) throw new Error('The maximum search limit for Deezer is 100');
    if (limit < 1) throw new Error('The minimum search limit for Deezer is 1');
    if (type !== 'track' && type !== 'album' && type != 'playlist')
        throw new Error(`"${type}" is not a valid Deezer search type`);

    query_ = encodeURIComponent(query_);
    const response = await request(
        `https://api.deezer.com/search/${type}/?q=${query_}&limit=${limit}${fuzzy ? '' : 'strict=on'}`
    ).catch((err: Error) => err);

    if (response instanceof Error) throw response;

    const jsonData = JSON.parse(response);

    if (jsonData.error) {
        throw new Error(`Deezer API Error: ${jsonData.error.type}: ${jsonData.error.message}`);
    }

    let results: Deezer[] = [];
    switch (type) {
        case 'track':
            results = jsonData.data.map((track: any) => new DeezerTrack(track, true));
            break;
        case 'playlist':
            results = jsonData.data.map((playlist: any) => new DeezerPlaylist(playlist, true));
            break;
        case 'album':
            results = jsonData.data.map((album: any) => new DeezerAlbum(album, true));
            break;
    }

    return results;
}

async function internalResolve(url: string): Promise<string> {
    const resolved = await request_resolve_redirect(url);
    const urlObj = new URL(resolved);
    urlObj.search = ''; // remove tracking parameters, not needed and also make that URL unnecessarily longer
    return urlObj.toString();
}

/**
 * Resolves a Deezer share link (deezer.page.link) to the equivalent Deezer link.
 *
 * The {@link deezer} function automatically does this if {@link dz_validate} returns 'share'.
 *
 * @param url The Deezer share link (deezer.page.link) to resolve
 * @returns The resolved URL.
 */
export async function dz_resolve_share_url(url: string): Promise<string> {
    const typeData = internalValidate(url);

    if (typeData.type === 'share') {
        return await internalResolve(url);
    } else if (typeData.type === 'track' || typeData.type === 'playlist' || typeData.type === 'album') {
        return url;
    } else {
        throw new Error('This is not a valid Deezer URL');
    }
}
