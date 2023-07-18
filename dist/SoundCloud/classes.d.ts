/// <reference types="node" />
import { Readable } from 'node:stream';
import { StreamType } from '../YouTube/stream';
import { PlaylistJSON, SoundTrackJSON } from './constants';
export interface SoundCloudUser {
    /**
     * SoundCloud User Name
     */
    name: string;
    /**
     * SoundCloud User ID
     */
    id: string;
    /**
     * SoundCloud User URL
     */
    url: string;
    /**
     * SoundCloud Class type. == "user"
     */
    type: 'track' | 'playlist' | 'user';
    /**
     * SoundCloud User Verified status
     */
    verified: boolean;
    /**
     * SoundCloud User Description
     */
    description: string;
    /**
     * SoundCloud User First Name
     */
    first_name: string;
    /**
     * SoundCloud User Full Name
     */
    full_name: string;
    /**
     * SoundCloud User Last Name
     */
    last_name: string;
    /**
     * SoundCloud User thumbnail URL
     */
    thumbnail: string;
}
export interface SoundCloudTrackDeprecated {
    /**
     * SoundCloud Track fetched status
     */
    fetched: boolean;
    /**
     * SoundCloud Track ID
     */
    id: number;
    /**
     * SoundCloud Class type. == "track"
     */
    type: 'track';
}
export interface SoundCloudTrackFormat {
    /**
     * SoundCloud Track Format Url
     */
    url: string;
    /**
     * SoundCloud Track Format preset
     */
    preset: string;
    /**
     * SoundCloud Track Format Duration
     */
    duration: number;
    /**
     * SoundCloud Track Format data containing protocol and mime_type
     */
    format: {
        protocol: string;
        mime_type: string;
    };
    /**
     * SoundCloud Track Format quality
     */
    quality: string;
}
/**
 * SoundCloud Track Class
 */
export declare class SoundCloudTrack {
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
     * SoundCloud Class type. === "track"
     */
    type: 'track' | 'playlist' | 'user';
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
    constructor(data: any);
    /**
     * Converts class to JSON
     * @returns JSON parsed Data
     */
    toJSON(): SoundTrackJSON;
}
/**
 * SoundCloud Playlist Class
 */
export declare class SoundCloudPlaylist {
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
     * SoundCloud Class type. == "playlist"
     */
    type: 'track' | 'playlist' | 'user';
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
    /**
     * SoundCloud Client ID provided by user
     * @private
     */
    private client_id;
    /**
     * Constructor for SoundCloud Playlist
     * @param data JSON parsed SoundCloud playlist data
     * @param client_id Provided SoundCloud Client ID
     */
    constructor(data: any, client_id: string);
    /**
     * Fetches all unfetched songs in a playlist.
     *
     * For fetching songs and getting all songs, see `fetched_tracks` property.
     * @returns playlist class
     */
    fetch(): Promise<SoundCloudPlaylist>;
    /**
     * Get total no. of fetched tracks
     * @see {@link SoundCloudPlaylist.all_tracks}
     */
    get total_tracks(): number;
    /**
     * Fetches all the tracks in the playlist and returns them
     *
     * ```ts
     * const playlist = await play.soundcloud('playlist url')
     *
     * const tracks = await playlist.all_tracks()
     * ```
     * @returns An array of {@link SoundCloudTrack}
     */
    all_tracks(): Promise<SoundCloudTrack[]>;
    /**
     * Converts Class to JSON data
     * @returns JSON parsed data
     */
    toJSON(): PlaylistJSON;
}
/**
 * SoundCloud Stream class
 */
export declare class SoundCloudStream {
    /**
     * Readable Stream through which data passes
     */
    stream: Readable;
    /**
     * Type of audio data that we recieved from normal youtube url.
     */
    type: StreamType;
    /**
     * Dash Url containing segment urls.
     * @private
     */
    private url;
    /**
     * Total time of downloaded segments data.
     * @private
     */
    private downloaded_time;
    /**
     * Timer for looping code every 5 minutes
     * @private
     */
    private timer;
    /**
     * Total segments Downloaded so far
     * @private
     */
    private downloaded_segments;
    /**
     * Incoming message that we recieve.
     *
     * Storing this is essential.
     * This helps to destroy the TCP connection completely if you stopped player in between the stream
     * @private
     */
    private request;
    /**
     * Array of segment time. Useful for calculating downloaded_time.
     */
    private time;
    /**
     * Array of segment_urls in dash file.
     */
    private segment_urls;
    /**
     * Constructor for SoundCloud Stream
     * @param url Dash url containing dash file.
     * @param type Stream Type
     */
    constructor(url: string, type?: StreamType);
    /**
     * Parses SoundCloud dash file.
     * @private
     */
    private parser;
    /**
     * Starts looping of code for getting all segments urls data
     */
    private start;
    /**
     * Main Loop function for getting all segments urls data
     */
    private loop;
    /**
     * This cleans every used variable in class.
     *
     * This is used to prevent re-use of this class and helping garbage collector to collect it.
     */
    private cleanup;
    /**
     * Pauses timer.
     * Stops running of loop.
     *
     * Useful if you don't want to get excess data to be stored in stream.
     */
    pause(): void;
    /**
     * Resumes timer.
     * Starts running of loop.
     */
    resume(): void;
}
//# sourceMappingURL=classes.d.ts.map