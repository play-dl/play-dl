import { SpotifyArtists, SpotifyCopyright, SpotifyThumbnail, SpotifyTrackAlbum } from './classes';
export interface TrackJSON {
    /**
     * Spotify Track Name
     */
    name: string;
    /**
     * Spotify Track ID
     */
    id: string;
    /**
     * Spotify Track url
     */
    url: string;
    /**
     * Spotify Track explicit info.
     */
    explicit: boolean;
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
}
export interface PlaylistJSON {
    /**
     * Spotify Playlist Name
     */
    name: string;
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
}
export interface AlbumJSON {
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
}
//# sourceMappingURL=constants.d.ts.map