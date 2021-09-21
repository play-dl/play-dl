export interface ChannelIconInterface {
    url?: string;
    width: number;
    height: number;
}

export class Channel {
    name?: string;
    verified?: boolean;
    id?: string;
    url?: string;
    icon?: ChannelIconInterface;
    subscribers?: string;

    constructor(data: any) {
        if (!data) throw new Error(`Cannot instantiate the ${this.constructor.name} class without data!`);

        this._patch(data);
    }

    private _patch(data: any): void {
        if (!data) data = {};

        this.name = data.name || null;
        this.verified = !!data.verified || false;
        this.id = data.id || null;
        this.url = data.url || null;
        this.icon = data.icon || { url: null, width: 0, height: 0 };
        this.subscribers = data.subscribers || null;
    }

    /**
     * Returns channel icon url
     * @param {object} options Icon options
     * @param {number} [options.size=0] Icon size. **Default is 0**
     */
    iconURL(options = { size: 0 }): string | undefined {
        if (typeof options.size !== 'number' || options.size < 0) throw new Error('invalid icon size');
        if (!this.icon?.url) return undefined;
        const def = this.icon.url.split('=s')[1].split('-c')[0];
        return this.icon.url.replace(`=s${def}-c`, `=s${options.size}-c`);
    }

    get type(): 'channel' {
        return 'channel';
    }

    toString(): string {
        return this.name || '';
    }

    toJSON() {
        return {
            name: this.name,
            verified: this.verified,
            id: this.id,
            url: this.url,
            iconURL: this.iconURL(),
            type: this.type,
            subscribers: this.subscribers
        };
    }
}
