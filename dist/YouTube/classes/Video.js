"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeVideo = void 0;
const Channel_1 = require("./Channel");
const Thumbnail_1 = require("./Thumbnail");
/**
 * Class for YouTube Video url
 */
class YouTubeVideo {
    /**
     * Constructor for YouTube Video Class
     * @param data JSON parsed data.
     */
    constructor(data) {
        if (!data)
            throw new Error(`Can not initiate ${this.constructor.name} without data`);
        this.id = data.id || undefined;
        this.url = `https://www.youtube.com/watch?v=${this.id}`;
        this.type = 'video';
        this.title = data.title || undefined;
        this.description = data.description || undefined;
        this.durationRaw = data.duration_raw || '0:00';
        this.durationInSec = (data.duration < 0 ? 0 : data.duration) || 0;
        this.uploadedAt = data.uploadedAt || undefined;
        this.liveAt = data.liveAt || undefined;
        this.upcoming = data.upcoming;
        this.views = parseInt(data.views) || 0;
        const thumbnails = [];
        for (const thumb of data.thumbnails) {
            thumbnails.push(new Thumbnail_1.YouTubeThumbnail(thumb));
        }
        this.thumbnails = thumbnails || [];
        this.channel = new Channel_1.YouTubeChannel(data.channel) || {};
        this.likes = data.likes || 0;
        this.live = !!data.live;
        this.private = !!data.private;
        this.tags = data.tags || [];
        this.discretionAdvised = data.discretionAdvised ?? undefined;
        this.music = data.music || [];
        this.chapters = data.chapters || [];
    }
    /**
     * Converts class to title name of video.
     * @returns Title name
     */
    toString() {
        return this.url || '';
    }
    /**
     * Converts class to JSON data
     * @returns JSON data.
     */
    toJSON() {
        return {
            id: this.id,
            url: this.url,
            title: this.title,
            description: this.description,
            durationInSec: this.durationInSec,
            durationRaw: this.durationRaw,
            uploadedAt: this.uploadedAt,
            thumbnail: this.thumbnails[this.thumbnails.length - 1].toJSON() || this.thumbnails,
            channel: this.channel,
            views: this.views,
            tags: this.tags,
            likes: this.likes,
            live: this.live,
            private: this.private,
            discretionAdvised: this.discretionAdvised,
            music: this.music,
            chapters: this.chapters
        };
    }
}
exports.YouTubeVideo = YouTubeVideo;
//# sourceMappingURL=Video.js.map