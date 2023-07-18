"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeChannel = void 0;
/**
 * YouTube Channel Class
 */
class YouTubeChannel {
    /**
     * YouTube Channel Constructor
     * @param data YouTube Channel data that we recieve from basic info or from search
     */
    constructor(data = {}) {
        if (!data)
            throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);
        this.type = 'channel';
        this.name = data.name || null;
        this.verified = !!data.verified || false;
        this.artist = !!data.artist || false;
        this.id = data.id || null;
        this.url = data.url || null;
        this.icons = data.icons || [{ url: null, width: 0, height: 0 }];
        this.subscribers = data.subscribers || null;
    }
    /**
     * Returns channel icon url
     * @param {object} options Icon options
     * @param {number} [options.size=0] Icon size. **Default is 0**
     */
    iconURL(options = { size: 0 }) {
        if (typeof options.size !== 'number' || options.size < 0)
            throw new Error('invalid icon size');
        if (!this.icons?.[0]?.url)
            return undefined;
        const def = this.icons?.[0]?.url.split('=s')[1].split('-c')[0];
        return this.icons?.[0]?.url.replace(`=s${def}-c`, `=s${options.size}-c`);
    }
    /**
     * Converts Channel Class to channel name.
     * @returns name of channel
     */
    toString() {
        return this.name || '';
    }
    /**
     * Converts Channel Class to JSON format
     * @returns json data of the channel
     */
    toJSON() {
        return {
            name: this.name,
            verified: this.verified,
            artist: this.artist,
            id: this.id,
            url: this.url,
            icons: this.icons,
            type: this.type,
            subscribers: this.subscribers
        };
    }
}
exports.YouTubeChannel = YouTubeChannel;
//# sourceMappingURL=Channel.js.map