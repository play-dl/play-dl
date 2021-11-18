import { SpotifyArtists, SpotifyThumbnail, SpotifyTrackAlbum } from './classes'

export interface TrackJSON{
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