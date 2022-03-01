export interface YouTubeChannelIcon {
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

export class YouTubeChannel {
    id: string;
    url: string;
    type: 'channel';
    name: string;
    verified: boolean;
    artist: boolean;
    icons: YouTubeChannelIcon[];
    subscribers: number;
    constructor(data: Omit<ChannelJSON, 'type'>) {
        this.id = data.id;
        this.url = data.url;
        this.type = 'channel';
        this.name = data.name;
        this.verified = !!data.verified;
        this.artist = !!data.artist;
        this.icons = data.icons;
        this.subscribers = data.subscribers;
    }

    toString() {
        return this.name;
    }

    toJSON(): ChannelJSON {
        return {
            id: this.id,
            url: this.url,
            type: this.type,
            name: this.name,
            verified: this.verified,
            artist: this.artist,
            icons: this.icons,
            subscribers: this.subscribers
        };
    }
}

interface ChannelJSON {
    id: string;
    url: string;
    type: 'channel';
    name: string;
    verified: boolean;
    artist: boolean;
    icons: YouTubeChannelIcon[];
    subscribers: number;
}
