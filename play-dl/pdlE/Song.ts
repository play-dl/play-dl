import { Thumbnail } from "./Thumbnail";

/**
 * Provides all the necessary information for a generic song object
 */
export interface Song {
    url: string;
    title?: string;
    author?: string;
    durationInSec: number;
    thumbnail?: Thumbnail;
}
