export class YouTubeThumbnail {
    url: string;
    width: number;
    height: number;

    constructor(data: Omit<ThumbnailJSON, 'type'>) {
        this.url = data.url;
        this.width = data.width;
        this.height = data.height;
    }

    unblur(): YouTubeThumbnail {
        this.url = this.url.split('?')[0];

        switch (this.url.split('/').at(-1)?.split('.')[0]) {
            case 'hq2':
            case 'hqdefault':
                this.width = 480;
                this.height = 360;
                break;
            case 'hq720':
                this.width = 1280;
                this.height = 720;
                break;
            case 'sddefault':
                this.width = 640;
                this.height = 480;
                break;
            case 'mqdefault':
                this.width = 320;
                this.height = 180;
                break;
            case 'default':
                this.width = 120;
                this.height = 90;
                break;
            default:
                this.width = this.height = NaN;
        }
        return this;
    }

    toJSON(): ThumbnailJSON {
        return {
            url: this.url,
            width: this.width,
            height: this.height
        };
    }

    toString() {
        return this.url;
    }
}

interface ThumbnailJSON {
    url: string;
    width: number;
    height: number;
}
