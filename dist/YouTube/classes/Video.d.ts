import { YouTubeChannel } from './Channel';
import { YouTubeThumbnail } from './Thumbnail';
/**
 * Licensed music in the video
 *
 * The property names change depending on your region's language.
 */
interface VideoMusic {
    song?: string;
    url?: string | null;
    artist?: string;
    album?: string;
    writers?: string;
    licenses?: string;
}
interface VideoOptions {
    /**
     * YouTube Video ID
     */
    id?: string;
    /**
     * YouTube video url
     */
    url: string;
    /**
     * YouTube Video title
     */
    title?: string;
    /**
     * YouTube Video description.
     */
    description?: string;
    /**
     * YouTube Video Duration Formatted
     */
    durationRaw: string;
    /**
     * YouTube Video Duration in seconds
     */
    durationInSec: number;
    /**
     * YouTube Video Uploaded Date
     */
    uploadedAt?: string;
    /**
     * If the video is upcoming or a premiere that isn't currently live, this will contain the premiere date, for watch page playlists this will be true, it defaults to undefined
     */
    upcoming?: Date | true;
    /**
     * YouTube Views
     */
    views: number;
    /**
     * YouTube Thumbnail Data
     */
    thumbnail?: {
        width: number | undefined;
        height: number | undefined;
        url: string | undefined;
    };
    /**
     * YouTube Video's uploader Channel Data
     */
    channel?: YouTubeChannel;
    /**
     * YouTube Video's likes
     */
    likes: number;
    /**
     * YouTube Video live status
     */
    live: boolean;
    /**
     * YouTube Video private status
     */
    private: boolean;
    /**
     * YouTube Video tags
     */
    tags: string[];
    /**
     * `true` if the video has been identified by the YouTube community as inappropriate or offensive to some audiences and viewer discretion is advised
     */
    discretionAdvised?: boolean;
    /**
     * Gives info about music content in that video.
     *
     * The property names of VideoMusic change depending on your region's language.
     */
    music?: VideoMusic[];
    /**
     * The chapters for this video
     *
     * If the video doesn't have any chapters or if the video object wasn't created by {@link video_basic_info} or {@link video_info} this will be an empty array.
     */
    chapters: VideoChapter[];
}
export interface VideoChapter {
    /**
     * The title of the chapter
     */
    title: string;
    /**
     * The timestamp of the start of the chapter
     */
    timestamp: string;
    /**
     * The start of the chapter in seconds
     */
    seconds: number;
    /**
     * Thumbnails of the frame at the start of this chapter
     */
    thumbnails: YouTubeThumbnail[];
}
/**
 * Class for YouTube Video url
 */
export declare class YouTubeVideo {
    /**
     * YouTube Video ID
     */
    id?: string;
    /**
     * YouTube video url
     */
    url: string;
    /**
     * YouTube Class type. == "video"
     */
    type: 'video' | 'playlist' | 'channel';
    /**
     * YouTube Video title
     */
    title?: string;
    /**
     * YouTube Video description.
     */
    description?: string;
    /**
     * YouTube Video Duration Formatted
     */
    durationRaw: string;
    /**
     * YouTube Video Duration in seconds
     */
    durationInSec: number;
    /**
     * YouTube Video Uploaded Date
     */
    uploadedAt?: string;
    /**
     * YouTube Live Date
     */
    liveAt?: string;
    /**
     * If the video is upcoming or a premiere that isn't currently live, this will contain the premiere date, for watch page playlists this will be true, it defaults to undefined
     */
    upcoming?: Date | true;
    /**
     * YouTube Views
     */
    views: number;
    /**
     * YouTube Thumbnail Data
     */
    thumbnails: YouTubeThumbnail[];
    /**
     * YouTube Video's uploader Channel Data
     */
    channel?: YouTubeChannel;
    /**
     * YouTube Video's likes
     */
    likes: number;
    /**
     * YouTube Video live status
     */
    live: boolean;
    /**
     * YouTube Video private status
     */
    private: boolean;
    /**
     * YouTube Video tags
     */
    tags: string[];
    /**
     * `true` if the video has been identified by the YouTube community as inappropriate or offensive to some audiences and viewer discretion is advised
     */
    discretionAdvised?: boolean;
    /**
     * Gives info about music content in that video.
     */
    music?: VideoMusic[];
    /**
     * The chapters for this video
     *
     * If the video doesn't have any chapters or if the video object wasn't created by {@link video_basic_info} or {@link video_info} this will be an empty array.
     */
    chapters: VideoChapter[];
    /**
     * Constructor for YouTube Video Class
     * @param data JSON parsed data.
     */
    constructor(data: any);
    /**
     * Converts class to title name of video.
     * @returns Title name
     */
    toString(): string;
    /**
     * Converts class to JSON data
     * @returns JSON data.
     */
    toJSON(): VideoOptions;
}
export {};
//# sourceMappingURL=Video.d.ts.map