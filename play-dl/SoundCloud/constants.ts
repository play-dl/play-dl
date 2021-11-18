import { SoundCloudTrackFormat, SoundCloudUser } from "./classes";

export interface SoundTrackJSON{
    /**
     * SoundCloud Track Name
     */
     name: string;
     /**
      * SoundCloud Track ID
      */
     id: number;
     /**
      * SoundCloud Track url
      */
     url: string;
     /**
      * SoundCloud Track fetched status
      */
     fetched: boolean;
     /**
      * SoundCloud Track Duration in seconds
      */
     durationInSec: number;
     /**
      * SoundCloud Track Duration in miili seconds
      */
     durationInMs: number;
     /**
      * SoundCloud Track formats data
      */
     formats: SoundCloudTrackFormat[];
     /**
      * SoundCloud Track Publisher Data
      */
     publisher: {
         name: string;
         id: number;
         artist: string;
         contains_music: boolean;
         writer_composer: string;
     } | null;
     /**
      * SoundCloud Track thumbnail
      */
     thumbnail: string;
     /**
      * SoundCloud Track user data
      */
     user: SoundCloudUser;
     /**
      * Constructor for SoundCloud Track Class
      * @param data JSON parsed track html data
      */
}