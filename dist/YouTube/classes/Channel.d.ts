export interface ChannelIconInterface {
    /**
     * YouTube Channel Icon URL
     */
    url: string;
    /**
     * YouTube Channel Icon Width
     */
    width: number;
    /**
     * YouTube Channel Icon Height
     */
    height: number;
}
/**
 * YouTube Channel Class
 */
export declare class YouTubeChannel {
    /**
     * YouTube Channel Title
     */
    name?: string;
    /**
     * YouTube Channel Verified status.
     */
    verified?: boolean;
    /**
     * YouTube Channel artist if any.
     */
    artist?: boolean;
    /**
     * YouTube Channel ID.
     */
    id?: string;
    /**
     * YouTube Class type. == "channel"
     */
    type: 'video' | 'playlist' | 'channel';
    /**
     * YouTube Channel Url
     */
    url?: string;
    /**
     * YouTube Channel Icons data.
     */
    icons?: ChannelIconInterface[];
    /**
     * YouTube Channel subscribers count.
     */
    subscribers?: string;
    /**
     * YouTube Channel Constructor
     * @param data YouTube Channel data that we recieve from basic info or from search
     */
    constructor(data?: any);
    /**
     * Returns channel icon url
     * @param {object} options Icon options
     * @param {number} [options.size=0] Icon size. **Default is 0**
     */
    iconURL(options?: {
        size: number;
    }): string | undefined;
    /**
     * Converts Channel Class to channel name.
     * @returns name of channel
     */
    toString(): string;
    /**
     * Converts Channel Class to JSON format
     * @returns json data of the channel
     */
    toJSON(): ChannelJSON;
}
interface ChannelJSON {
    /**
     * YouTube Channel Title
     */
    name?: string;
    /**
     * YouTube Channel Verified status.
     */
    verified?: boolean;
    /**
     * YouTube Channel artist if any.
     */
    artist?: boolean;
    /**
     * YouTube Channel ID.
     */
    id?: string;
    /**
     * Type of Class [ Channel ]
     */
    type: 'video' | 'playlist' | 'channel';
    /**
     * YouTube Channel Url
     */
    url?: string;
    /**
     * YouTube Channel Icon data.
     */
    icons?: ChannelIconInterface[];
    /**
     * YouTube Channel subscribers count.
     */
    subscribers?: string;
}
export {};
//# sourceMappingURL=Channel.d.ts.map