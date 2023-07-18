import { SoundCloudTrack, SoundCloudTrackDeprecated, SoundCloudTrackFormat, SoundCloudUser } from './classes';
export interface SoundTrackJSON {
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
     * User friendly SoundCloud track URL
     */
    permalink: string;
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
}
export interface PlaylistJSON {
    /**
     * SoundCloud Playlist Name
     */
    name: string;
    /**
     * SoundCloud Playlist ID
     */
    id: number;
    /**
     * SoundCloud Playlist URL
     */
    url: string;
    /**
     * SoundCloud Playlist Sub type. == "album" for soundcloud albums
     */
    sub_type: string;
    /**
     * SoundCloud Playlist Total Duration in seconds
     */
    durationInSec: number;
    /**
     * SoundCloud Playlist Total Duration in milli seconds
     */
    durationInMs: number;
    /**
     * SoundCloud Playlist user data
     */
    user: SoundCloudUser;
    /**
     * SoundCloud Playlist tracks [ It can be fetched or not fetched ]
     */
    tracks: SoundCloudTrack[] | SoundCloudTrackDeprecated[];
    /**
     * SoundCloud Playlist tracks number
     */
    tracksCount: number;
}
//# sourceMappingURL=constants.d.ts.map