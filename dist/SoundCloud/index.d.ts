import { SoundCloudPlaylist, SoundCloudTrack, SoundCloudStream } from './classes';
interface SoundDataOptions {
    client_id: string;
}
/**
 * Gets info from a soundcloud url.
 *
 * ```ts
 * let sound = await play.soundcloud('soundcloud url')
 *
 * // sound.type === "track" | "playlist" | "user"
 *
 * if (sound.type === "track") {
 *      spot = spot as play.SoundCloudTrack
 *      // Code with SoundCloud track class.
 * }
 * ```
 * @param url soundcloud url
 * @returns A {@link SoundCloudTrack} or {@link SoundCloudPlaylist}
 */
export declare function soundcloud(url: string): Promise<SoundCloud>;
/**
 * Type of SoundCloud
 */
export type SoundCloud = SoundCloudTrack | SoundCloudPlaylist;
/**
 * Function for searching in SoundCloud
 * @param query query to search
 * @param type 'tracks' | 'playlists' | 'albums'
 * @param limit max no. of results
 * @returns Array of SoundCloud type.
 */
export declare function so_search(query: string, type: 'tracks' | 'playlists' | 'albums', limit?: number): Promise<SoundCloud[]>;
/**
 * Main Function for creating a Stream of soundcloud
 * @param url soundcloud url
 * @param quality Quality to select from
 * @returns SoundCloud Stream
 */
export declare function stream(url: string, quality?: number): Promise<SoundCloudStream>;
/**
 * Gets Free SoundCloud Client ID.
 *
 * Use this in beginning of your code to add SoundCloud support.
 *
 * ```ts
 * play.getFreeClientID().then((clientID) => play.setToken({
 *      soundcloud : {
 *          client_id : clientID
 *      }
 * }))
 * ```
 * @returns client ID
 */
export declare function getFreeClientID(): Promise<string>;
/**
 * Function for creating a Stream of soundcloud using a SoundCloud Track Class
 * @param data SoundCloud Track Class
 * @param quality Quality to select from
 * @returns SoundCloud Stream
 */
export declare function stream_from_info(data: SoundCloudTrack, quality?: number): Promise<SoundCloudStream>;
/**
 * Function to check client ID
 * @param id Client ID
 * @returns boolean
 */
export declare function check_id(id: string): Promise<boolean>;
/**
 * Validates a soundcloud url
 * @param url soundcloud url
 * @returns
 * ```ts
 * false | 'track' | 'playlist'
 * ```
 */
export declare function so_validate(url: string): Promise<false | 'track' | 'playlist' | 'search'>;
export declare function setSoundCloudToken(options: SoundDataOptions): void;
export { SoundCloudTrack, SoundCloudPlaylist, SoundCloudStream };
//# sourceMappingURL=index.d.ts.map