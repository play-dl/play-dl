import { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack } from './classes';
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
export declare function spotify(url: string): Promise<Spotify>;
/**
 * Validate Spotify url
 * @param url Spotify URL
 * @returns
 * ```ts
 * 'track' | 'playlist' | 'album' | 'search' | false
 * ```
 */
export declare function sp_validate(url: string): 'track' | 'playlist' | 'album' | 'search' | false;
/**
 * Fuction for authorizing for spotify data.
 * @param data Sportify Data options to validate
 * @returns boolean.
 */
export declare function SpotifyAuthorize(data: SpotifyDataOptions, file: boolean, client_flow?: boolean): Promise<boolean>;
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
export declare function is_expired(): boolean;
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
export declare function sp_search(query: string, type: 'album' | 'playlist' | 'track', limit?: number): Promise<Spotify[]>;
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
export declare function refreshToken(): Promise<boolean>;
export declare function setSpotifyToken(options: SpotifyDataOptions): Promise<void>;
export { SpotifyTrack, SpotifyAlbum, SpotifyPlaylist };
//# sourceMappingURL=index.d.ts.map