"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeThumbnail = void 0;
class YouTubeThumbnail {
    constructor(data) {
        this.url = data.url;
        this.width = data.width;
        this.height = data.height;
    }
    toJSON() {
        return {
            url: this.url,
            width: this.width,
            height: this.height
        };
    }
}
exports.YouTubeThumbnail = YouTubeThumbnail;
//# sourceMappingURL=Thumbnail.js.map