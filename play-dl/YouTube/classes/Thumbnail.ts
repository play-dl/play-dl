export class YouTubeThumbnail {
    url: string;
    width: number;
    height: number;

    constructor(data: any) {
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
