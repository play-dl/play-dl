/**
 * Interface representing an image on Deezer
 * available in four sizes
 */
interface DeezerImage {
    /**
     * The largest version of the image
     */
    xl: string;
    /**
     * The second largest version of the image
     */
    big: string;
    /**
     * The second smallest version of the image
     */
    medium: string;
    /**
     * The smallest version of the image
     */
    small: string;
}
/**
 * Interface representing a Deezer genre
 */
interface DeezerGenre {
    /**
     * The name of the genre
     */
    name: string;
    /**
     * The thumbnail of the genre available in four sizes
     */
    picture: DeezerImage;
}
/**
 * Interface representing a Deezer user account
 */
interface DeezerUser {
    /**
     * The id of the user
     */
    id: number;
    /**
     * The name of the user
     */
    name: string;
}
/**
 * Class representing a Deezer track
 */
export declare class DeezerTrack {
    /**
     * The id of the track
     */
    id: number;
    /**
     * The title of the track
     */
    title: string;
    /**
     * A shorter version of the title
     */
    shortTitle: string;
    /**
     * The URL of the track on Deezer
     */
    url: string;
    /**
     * The duration of the track in seconds
     */
    durationInSec: number;
    /**
     * The rank of the track
     */
    rank: number;
    /**
     * `true` if the track contains any explicit lyrics
     */
    explicit: boolean;
    /**
     * URL to a file containing the first 30 seconds of the track
     */
    previewURL: string;
    /**
     * The artist of the track
     */
    artist: DeezerArtist;
    /**
     * The album that this track is in
     */
    album: DeezerTrackAlbum;
    /**
     * The type, always `'track'`, useful to determine what the deezer function returned
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * Signifies that some properties are not populated
     *
     * Partial tracks can be populated by calling {@link DeezerTrack.fetch}.
     *
     * `true` for tracks in search results and `false` if the track was fetched directly or expanded.
     */
    partial: boolean;
    /**
     * The position of the track in the album
     *
     * `undefined` for partial tracks
     *
     * @see {@link DeezerTrack.partial}
     */
    trackPosition?: number;
    /**
     * The number of the disk the track is on
     *
     * `undefined` for partial tracks
     *
     * @see {@link DeezerTrack.partial}
     */
    diskNumber?: number;
    /**
     * The release date
     *
     * `undefined` for partial tracks
     *
     * @see {@link DeezerTrack.partial}
     */
    releaseDate?: Date;
    /**
     * The number of beats per minute
     *
     * `undefined` for partial tracks
     *
     * @see {@link DeezerTrack.partial}
     */
    bpm?: number;
    /**
     * The gain of the track
     *
     * `undefined` for partial tracks
     *
     * @see {@link DeezerTrack.partial}
     */
    gain?: number;
    /**
     * The artists that have contributed to the track
     *
     * `undefined` for partial tracks
     *
     * @see {@link DeezerTrack.partial}
     */
    contributors?: DeezerArtist[];
    /**
     * Creates a Deezer track from the data in an API response
     * @param data the data to use to create the track
     * @param partial Whether the track should be partial
     * @see {@link DeezerTrack.partial}
     */
    constructor(data: any, partial: boolean);
    /**
     * Fetches and populates the missing fields
     *
     * The property {@link partial} will be `false` if this method finishes successfully.
     *
     * @returns A promise with the same track this method was called on.
     */
    fetch(): Promise<DeezerTrack>;
    /**
     * Converts instances of this class to JSON data
     * @returns JSON data.
     */
    toJSON(): {
        id: number;
        title: string;
        shortTitle: string;
        url: string;
        durationInSec: number;
        rank: number;
        explicit: boolean;
        previewURL: string;
        artist: DeezerArtist;
        album: DeezerTrackAlbum;
        type: "playlist" | "track" | "album";
        trackPosition: number | undefined;
        diskNumber: number | undefined;
        releaseDate: Date | undefined;
        bpm: number | undefined;
        gain: number | undefined;
        contributors: DeezerArtist[] | undefined;
    };
}
/**
 * Class for Deezer Albums
 */
export declare class DeezerAlbum {
    /**
     * The id of the album
     */
    id: number;
    /**
     * The title of the album
     */
    title: string;
    /**
     * The URL to the album on Deezer
     */
    url: string;
    /**
     * The record type of the album (e.g. EP, ALBUM, etc ...)
     */
    recordType: string;
    /**
     * `true` if the album contains any explicit lyrics
     */
    explicit: boolean;
    /**
     * The artist of the album
     */
    artist: DeezerArtist;
    /**
     * The album cover available in four sizes
     */
    cover: DeezerImage;
    /**
     * The type, always `'album'`, useful to determine what the deezer function returned
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * The number of tracks in the album
     */
    tracksCount: number;
    /**
     * Signifies that some properties are not populated
     *
     * Partial albums can be populated by calling {@link DeezerAlbum.fetch}.
     *
     * `true` for albums in search results and `false` if the album was fetched directly or expanded.
     */
    partial: boolean;
    /**
     * The **u**niversal **p**roduct **c**ode of the album
     *
     * `undefined` for partial albums
     *
     * @see {@link DeezerAlbum.partial}
     */
    upc?: string;
    /**
     * The duration of the album in seconds
     *
     * `undefined` for partial albums
     *
     * @see {@link DeezerAlbum.partial}
     */
    durationInSec?: number;
    /**
     * The number of fans the album has
     *
     * `undefined` for partial albums
     *
     * @see {@link DeezerAlbum.partial}
     */
    numberOfFans?: number;
    /**
     * The release date of the album
     *
     * `undefined` for partial albums
     *
     * @see {@link DeezerAlbum.partial}
     */
    releaseDate?: Date;
    /**
     * Whether the album is available
     *
     * `undefined` for partial albums
     *
     * @see {@link DeezerAlbum.partial}
     */
    available?: boolean;
    /**
     * The list of genres present in this album
     *
     * `undefined` for partial albums
     *
     * @see {@link DeezerAlbum.partial}
     */
    genres?: DeezerGenre[];
    /**
     * The contributors to the album
     *
     * `undefined` for partial albums
     *
     * @see {@link DeezerAlbum.partial}
     */
    contributors?: DeezerArtist[];
    /**
     * The list of tracks in the album
     *
     * empty (length === 0) for partial albums
     *
     * Use {@link DeezerAlbum.fetch} to populate the tracks and other properties
     *
     * @see {@link DeezerAlbum.partial}
     */
    tracks: DeezerTrack[];
    /**
     * Creates a Deezer album from the data in an API response
     * @param data the data to use to create the album
     * @param partial Whether the album should be partial
     * @see {@link DeezerAlbum.partial}
     */
    constructor(data: any, partial: boolean);
    /**
     * Fetches and populates the missing fields including all tracks.
     *
     * The property {@link DeezerAlbum.partial} will be `false` if this method finishes successfully.
     *
     * @returns A promise with the same album this method was called on.
     */
    fetch(): Promise<DeezerAlbum>;
    /**
     * Fetches all the tracks in the album and returns them
     *
     * ```ts
     * const album = await play.deezer('album url')
     *
     * const tracks = await album.all_tracks()
     * ```
     * @returns An array of {@link DeezerTrack}
     */
    all_tracks(): Promise<DeezerTrack[]>;
    /**
     * Converts instances of this class to JSON data
     * @returns JSON data.
     */
    toJSON(): {
        id: number;
        title: string;
        url: string;
        recordType: string;
        explicit: boolean;
        artist: DeezerArtist;
        cover: DeezerImage;
        type: "playlist" | "track" | "album";
        upc: string | undefined;
        tracksCount: number;
        durationInSec: number | undefined;
        numberOfFans: number | undefined;
        releaseDate: Date | undefined;
        available: boolean | undefined;
        genres: DeezerGenre[] | undefined;
        contributors: DeezerArtist[] | undefined;
        tracks: {
            id: number;
            title: string;
            shortTitle: string;
            url: string;
            durationInSec: number;
            rank: number;
            explicit: boolean;
            previewURL: string;
            artist: DeezerArtist;
            album: DeezerTrackAlbum;
            type: "playlist" | "track" | "album";
            trackPosition: number | undefined;
            diskNumber: number | undefined;
            releaseDate: Date | undefined;
            bpm: number | undefined;
            gain: number | undefined;
            contributors: DeezerArtist[] | undefined;
        }[];
    };
}
/**
 * Class for Deezer Playlists
 */
export declare class DeezerPlaylist {
    /**
     * The id of the playlist
     */
    id: number;
    /**
     * The title of the playlist
     */
    title: string;
    /**
     * Whether the playlist is public or private
     */
    public: boolean;
    /**
     * The URL of the playlist on Deezer
     */
    url: string;
    /**
     * Cover picture of the playlist available in four sizes
     */
    picture: DeezerImage;
    /**
     * The date of the playlist's creation
     */
    creationDate: Date;
    /**
     * The type, always `'playlist'`, useful to determine what the deezer function returned
     */
    type: 'track' | 'playlist' | 'album';
    /**
     * The Deezer user that created the playlist
     */
    creator: DeezerUser;
    /**
     * The number of tracks in the playlist
     */
    tracksCount: number;
    /**
     * Signifies that some properties are not populated
     *
     * Partial playlists can be populated by calling {@link DeezerPlaylist.fetch}.
     *
     * `true` for playlists in search results and `false` if the album was fetched directly or expanded.
     */
    partial: boolean;
    /**
     * Description of the playlist
     *
     * `undefined` for partial playlists
     *
     * @see {@link DeezerPlaylist.partial}
     */
    description?: string;
    /**
     * Duration of the playlist in seconds
     *
     * `undefined` for partial playlists
     *
     * @see {@link DeezerPlaylist.partial}
     */
    durationInSec?: number;
    /**
     * `true` if the playlist is the loved tracks playlist
     *
     * `undefined` for partial playlists
     *
     * @see {@link DeezerPlaylist.partial}
     */
    isLoved?: boolean;
    /**
     * Whether multiple users have worked on the playlist
     *
     * `undefined` for partial playlists
     *
     * @see {@link DeezerPlaylist.partial}
     */
    collaborative?: boolean;
    /**
     * The number of fans the playlist has
     *
     * `undefined` for partial playlists
     *
     * @see {@link DeezerPlaylist.partial}
     */
    fans?: number;
    /**
     * The list of tracks in the playlist
     *
     * empty (length === 0) for partial and non public playlists
     *
     * Use {@link DeezerPlaylist.fetch} to populate the tracks and other properties
     *
     * @see {@link DeezerPlaylist.partial}
     * @see {@link DeezerPlaylist.public}
     */
    tracks: DeezerTrack[];
    /**
     * Creates a Deezer playlist from the data in an API response
     * @param data the data to use to create the playlist
     * @param partial Whether the playlist should be partial
     * @see {@link DeezerPlaylist.partial}
     */
    constructor(data: any, partial: boolean);
    /**
     * Fetches and populates the missing fields, including all tracks.
     *
     * The property {@link DeezerPlaylist.partial} will be `false` if this method finishes successfully.
     *
     * @returns A promise with the same playlist this method was called on.
     */
    fetch(): Promise<DeezerPlaylist>;
    /**
     * Fetches all the tracks in the playlist and returns them
     *
     * ```ts
     * const playlist = await play.deezer('playlist url')
     *
     * const tracks = await playlist.all_tracks()
     * ```
     * @returns An array of {@link DeezerTrack}
     */
    all_tracks(): Promise<DeezerTrack[]>;
    /**
     * Converts instances of this class to JSON data
     * @returns JSON data.
     */
    toJSON(): {
        id: number;
        title: string;
        public: boolean;
        url: string;
        picture: DeezerImage;
        creationDate: Date;
        type: "playlist" | "track" | "album";
        creator: DeezerUser;
        tracksCount: number;
        description: string | undefined;
        durationInSec: number | undefined;
        isLoved: boolean | undefined;
        collaborative: boolean | undefined;
        fans: number | undefined;
        tracks: {
            id: number;
            title: string;
            shortTitle: string;
            url: string;
            durationInSec: number;
            rank: number;
            explicit: boolean;
            previewURL: string;
            artist: DeezerArtist;
            album: DeezerTrackAlbum;
            type: "playlist" | "track" | "album";
            trackPosition: number | undefined;
            diskNumber: number | undefined;
            releaseDate: Date | undefined;
            bpm: number | undefined;
            gain: number | undefined;
            contributors: DeezerArtist[] | undefined;
        }[];
    };
}
declare class DeezerTrackAlbum {
    id: number;
    title: string;
    url: string;
    cover: DeezerImage;
    releaseDate?: Date;
    constructor(data: any);
}
/**
 * Class representing a Deezer artist
 */
declare class DeezerArtist {
    /**
     * The id of the artist
     */
    id: number;
    /**
     * The name of the artist
     */
    name: string;
    /**
     * The URL of the artist on Deezer
     */
    url: string;
    /**
     * The picture of the artist available in four sizes
     */
    picture?: DeezerImage;
    /**
     * The of the artist on the track
     */
    role?: string;
    constructor(data: any);
}
export {};
//# sourceMappingURL=classes.d.ts.map