import { LiveStream, Stream } from './classes/LiveStream';
import { SeekStream } from './classes/SeekStream';
import { InfoData, StreamInfoData } from './utils/constants';
export declare enum StreamType {
    Arbitrary = "arbitrary",
    Raw = "raw",
    OggOpus = "ogg/opus",
    WebmOpus = "webm/opus",
    Opus = "opus"
}
export interface StreamOptions {
    seek?: number;
    quality?: number;
    language?: string;
    htmldata?: boolean;
    precache?: number;
    discordPlayerCompatibility?: boolean;
}
/**
 * Command to find audio formats from given format array
 * @param formats Formats to search from
 * @returns Audio Formats array
 */
export declare function parseAudioFormats(formats: any[]): any[];
/**
 * Type for YouTube Stream
 */
export type YouTubeStream = Stream | LiveStream | SeekStream;
/**
 * Stream command for YouTube
 * @param url YouTube URL
 * @param options lets you add quality for stream
 * @returns Stream class with type and stream for playing.
 */
export declare function stream(url: string, options?: StreamOptions): Promise<YouTubeStream>;
/**
 * Stream command for YouTube using info from video_info or decipher_info function.
 * @param info video_info data
 * @param options lets you add quality for stream
 * @returns Stream class with type and stream for playing.
 */
export declare function stream_from_info(info: InfoData | StreamInfoData, options?: StreamOptions): Promise<YouTubeStream>;
//# sourceMappingURL=stream.d.ts.map