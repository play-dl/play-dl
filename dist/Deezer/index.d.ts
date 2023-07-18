import { DeezerAlbum, DeezerPlaylist, DeezerTrack } from './classes';
interface DeezerSearchOptions {
    /**
     * The type to search for `'track'`, `'playlist'` or `'album'`. Defaults to `'track'`.
     */
    type?: 'track' | 'playlist' | 'album';
    /**
     * The maximum number of results to return, maximum `100`, defaults to `10`.
     */
    limit?: number;
    /**
     * Whether the search should be fuzzy or only return exact matches. Defaults to `true`.
     */
    fuzzy?: boolean;
}
interface DeezerAdvancedSearchOptions {
    /**
     * The maximum number of results to return, maximum `100`, defaults to `10`.
     */
    limit?: number;
    /**
     * The name of the artist.
     */
    artist?: string;
    /**
     * The title of the album.
     */
    album?: string;
    /**
     * The title of the track.
     */
    title?: string;
    /**
     * The label that released the track.
     */
    label?: string;
    /**
     * The minimum duration in seconds.
     */
    minDurationInSec?: number;
    /**
     * The maximum duration in seconds.
     */
    maxDurationInSec?: number;
    /**
     * The minimum BPM.
     */
    minBPM?: number;
    /**
     * The minimum BPM.
     */
    maxBPM?: number;
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
export declare function deezer(url: string): Promise<Deezer>;
/**
 * Validates a Deezer URL
 * @param url The URL to validate
 * @returns The type of the URL either `'track'`, `'playlist'`, `'album'`, `'search'` or `false`.
 * `false` means that the provided URL was a wrongly formatted or an unsupported Deezer URL.
 */
export declare function dz_validate(url: string): Promise<'track' | 'playlist' | 'album' | 'search' | false>;
/**
 * Searches Deezer for tracks, playlists or albums
 * @param query The search query
 * @param options Extra options to configure the search:
 *
 * * type?: The type to search for `'track'`, `'playlist'` or `'album'`. Defaults to `'track'`.
 * * limit?: The maximum number of results to return, maximum `100`, defaults to `10`.
 * * fuzzy?: Whether the search should be fuzzy or only return exact matches. Defaults to `true`.
 * @returns An array of tracks, playlists or albums
 */
export declare function dz_search(query: string, options: DeezerSearchOptions): Promise<Deezer[]>;
/**
 * Searches Deezer for tracks using the specified metadata.
 * @param options The metadata and limit for the search
 *
 * * limit?: The maximum number of results to return, maximum `100`, defaults to `10`.
 * * artist?: The name of the artist
 * * album?: The title of the album
 * * title?: The title of the track
 * * label?: The label that released the track
 * * minDurationInSec?: The minimum duration in seconds
 * * maxDurationInSec?: The maximum duration in seconds
 * * minBpm?: The minimum BPM
 * * maxBpm?: The minimum BPM
 * @returns An array of tracks matching the metadata
 */
export declare function dz_advanced_track_search(options: DeezerAdvancedSearchOptions): Promise<DeezerTrack[]>;
export { DeezerTrack, DeezerAlbum, DeezerPlaylist };
//# sourceMappingURL=index.d.ts.map