import { SpotifyDataOptions } from '.';
import { AlbumJSON, PlaylistJSON, TrackJSON } from './constants';
export interface SpotifyTrackAlbum {
    /**
     * Spotify Track Album name
     */
    name: string;
    /**
     * Spotify Track Album url
     */
    url: string;
    /**
     * Spotify Track Album id
     */
    id: string;
    /**
     * Spotify Track Album release date
     */
    release_date: string;
    /**
     * Spotify Track Album release date **precise**
     */
    release_date_precision: string;
    /**
     * Spotify Track Album total tracks number
     */
    total_tracks: number;
}
export interface SpotifyArtists {
    /**
     * Spotify Artist Name
     */
    name: string;
    /**
     * Spotify Artist Url
     */
    url: string;
    /**
     * Spotify Artist ID
     */
    id: string;
}
export interface SpotifyThumbnail {
    /**
     * Spotify Thumbnail height
     */
    height: number;
    /**
     * Spotify Thumbnail width
     */
    width: number;
    /**
     * Spotify Thumbnail url
     */
    url: string;
}
export interface SpotifyCopyright {
    /**
     * Spotify Copyright Text
     */
    text: string;
    /**
     * Spotify Copyright Type
     */
    type: string;
}
/**
 * Spotify Track Class
 */
export declare class SpotifyTrack {
    /**
     * Spotify Track Name
     */
    name: string;
    /**
     * Spotify Class type. == "track"
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * Spotify Track ID
     */
    id: string;
    /**
     * Spotify Track ISRC
     */
    isrc: string;
    /**
     * Spotify Track url
     */
    url: string;
    /**
     * Spotify Track explicit info.
     */
    explicit: boolean;
    /**
     * Spotify Track playability info.
     */
    playable: boolean;
    /**
     * Spotify Track Duration in seconds
     */
    durationInSec: number;
    /**
     * Spotify Track Duration in milli seconds
     */
    durationInMs: number;
    /**
     * Spotify Track Artists data [ array ]
     */
    artists: SpotifyArtists[];
    /**
     * Spotify Track Album data
     */
    album: SpotifyTrackAlbum | undefined;
    /**
     * Spotify Track Thumbnail Data
     */
    thumbnail: SpotifyThumbnail | undefined;
    /**
     * Constructor for Spotify Track
     * @param data
     */
    constructor(data: any);
    toJSON(): TrackJSON;
}
/**
 * Spotify Playlist Class
 */
export declare class SpotifyPlaylist {
    /**
     * Spotify Playlist Name
     */
    name: string;
    /**
     * Spotify Class type. == "playlist"
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * Spotify Playlist collaborative boolean.
     */
    collaborative: boolean;
    /**
     * Spotify Playlist Description
     */
    description: string;
    /**
     * Spotify Playlist URL
     */
    url: string;
    /**
     * Spotify Playlist ID
     */
    id: string;
    /**
     * Spotify Playlist Thumbnail Data
     */
    thumbnail: SpotifyThumbnail;
    /**
     * Spotify Playlist Owner Artist data
     */
    owner: SpotifyArtists;
    /**
     * Spotify Playlist total tracks Count
     */
    tracksCount: number;
    /**
     * Spotify Playlist Spotify data
     *
     * @private
     */
    private spotifyData;
    /**
     * Spotify Playlist fetched tracks Map
     *
     * @private
     */
    private fetched_tracks;
    /**
     * Boolean to tell whether it is a searched result or not.
     */
    private readonly search;
    /**
     * Constructor for Spotify Playlist Class
     * @param data JSON parsed data of playlist
     * @param spotifyData Data about sporify token for furhter fetching.
     */
    constructor(data: any, spotifyData: SpotifyDataOptions, search: boolean);
    /**
     * Fetches Spotify Playlist tracks more than 100 tracks.
     *
     * For getting all tracks in playlist, see `total_pages` property.
     * @returns Playlist Class.
     */
    fetch(): Promise<this>;
    /**
     * Spotify Playlist tracks are divided in pages.
     *
     * For example getting data of 101 - 200 videos in a playlist,
     *
     * ```ts
     * const playlist = await play.spotify('playlist url')
     *
     * await playlist.fetch()
     *
     * const result = playlist.page(2)
     * ```
     * @param num Page Number
     * @returns
     */
    page(num: number): SpotifyTrack[];
    /**
     * Gets total number of pages in that playlist class.
     * @see {@link SpotifyPlaylist.all_tracks}
     */
    get total_pages(): number;
    /**
     * Spotify Playlist total no of tracks that have been fetched so far.
     */
    get total_tracks(): number;
    /**
     * Fetches all the tracks in the playlist and returns them
     *
     * ```ts
     * const playlist = await play.spotify('playlist url')
     *
     * const tracks = await playlist.all_tracks()
     * ```
     * @returns An array of {@link SpotifyTrack}
     */
    all_tracks(): Promise<SpotifyTrack[]>;
    /**
     * Converts Class to JSON
     * @returns JSON data
     */
    toJSON(): PlaylistJSON;
}
/**
 * Spotify Album Class
 */
export declare class SpotifyAlbum {
    /**
     * Spotify Album Name
     */
    name: string;
    /**
     * Spotify Class type. == "album"
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * Spotify Album url
     */
    url: string;
    /**
     * Spotify Album id
     */
    id: string;
    /**
     * Spotify Album Thumbnail data
     */
    thumbnail: SpotifyThumbnail;
    /**
     * Spotify Album artists [ array ]
     */
    artists: SpotifyArtists[];
    /**
     * Spotify Album copyright data [ array ]
     */
    copyrights: SpotifyCopyright[];
    /**
     * Spotify Album Release date
     */
    release_date: string;
    /**
     * Spotify Album Release Date **precise**
     */
    release_date_precision: string;
    /**
     * Spotify Album total no of tracks
     */
    tracksCount: number;
    /**
     * Spotify Album Spotify data
     *
     * @private
     */
    private spotifyData;
    /**
     * Spotify Album fetched tracks Map
     *
     * @private
     */
    private fetched_tracks;
    /**
     * Boolean to tell whether it is a searched result or not.
     */
    private readonly search;
    /**
     * Constructor for Spotify Album Class
     * @param data Json parsed album data
     * @param spotifyData Spotify credentials
     */
    constructor(data: any, spotifyData: SpotifyDataOptions, search: boolean);
    /**
     * Fetches Spotify Album tracks more than 50 tracks.
     *
     * For getting all tracks in album, see `total_pages` property.
     * @returns Album Class.
     */
    fetch(): Promise<this>;
    /**
     * Spotify Album tracks are divided in pages.
     *
     * For example getting data of 51 - 100 videos in a album,
     *
     * ```ts
     * const album = await play.spotify('album url')
     *
     * await album.fetch()
     *
     * const result = album.page(2)
     * ```
     * @param num Page Number
     * @returns
     */
    page(num: number): SpotifyTrack[] | undefined;
    /**
     * Gets total number of pages in that album class.
     * @see {@link SpotifyAlbum.all_tracks}
     */
    get total_pages(): number;
    /**
     * Spotify Album total no of tracks that have been fetched so far.
     */
    get total_tracks(): number;
    /**
     * Fetches all the tracks in the album and returns them
     *
     * ```ts
     * const album = await play.spotify('album url')
     *
     * const tracks = await album.all_tracks()
     * ```
     * @returns An array of {@link SpotifyTrack}
     */
    all_tracks(): Promise<SpotifyTrack[]>;
    /**
     * Converts Class to JSON
     * @returns JSON data
     */
    toJSON(): AlbumJSON;
}
//# sourceMappingURL=classes.d.ts.map