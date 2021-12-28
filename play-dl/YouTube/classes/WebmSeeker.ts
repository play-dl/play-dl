import { WebmElements, WebmHeader } from 'play-audio';
import { Duplex, DuplexOptions } from 'stream';

enum DataType {
    master,
    string,
    uint,
    binary,
    float
}

export enum WebmSeekerState {
    READING_HEAD = 'READING_HEAD',
    READING_DATA = 'READING_DATA'
}

interface WebmSeekerOptions extends DuplexOptions {
    mode?: 'precise' | 'granular';
}

export class WebmSeeker extends Duplex {
    remaining?: Buffer;
    state: WebmSeekerState;
    mode: 'precise' | 'granular';
    chunk?: Buffer;
    cursor: number;
    header: WebmHeader;
    headfound: boolean;
    headerparsed: boolean;
    time_left: number;
    seekfound: boolean;
    private data_size: number;
    private data_length: number;

    constructor(options: WebmSeekerOptions) {
        super(options);
        this.state = WebmSeekerState.READING_HEAD;
        this.cursor = 0;
        this.header = new WebmHeader();
        this.headfound = false;
        this.time_left = 0;
        this.headerparsed = false;
        this.seekfound = false;
        this.data_length = 0;
        this.mode = options.mode || 'granular';
        this.data_size = 0;
    }

    private get vint_length(): number {
        let i = 0;
        for (; i < 8; i++) {
            if ((1 << (7 - i)) & this.chunk![this.cursor]) break;
        }
        return ++i;
    }

    private get vint_value(): boolean {
        if (!this.chunk) return false;
        const length = this.vint_length;
        if (this.chunk.length < this.cursor + length) return false;
        let value = this.chunk[this.cursor] & ((1 << (8 - length)) - 1);
        for (let i = this.cursor + 1; i < this.cursor + length; i++) value = (value << 8) + this.chunk[i];
        this.data_size = length;
        this.data_length = value;
        return true;
    }

    cleanup() {
        this.cursor = 0;
        this.chunk = undefined;
        this.remaining = undefined;
    }

    _read() {}

    seek(sec: number): Error | number {
        let position = 0;
        let time = Math.floor(sec / 10) * 10;
        this.time_left = (sec - time) * 1000 || 0;
        if (!this.header.segment.cues) return new Error('Failed to Parse Cues');

        for (const data of this.header.segment.cues) {
            if (Math.floor((data.time as number) / 1000) === time) {
                position = data.position as number;
                break;
            } else continue;
        }
        if (position === 0) return new Error('Failed to find Cluster Position');
        else return position;
    }

    _write(chunk: Buffer, _: BufferEncoding, callback: (error?: Error | null) => void): void {
        if (this.remaining) {
            this.chunk = Buffer.concat([this.remaining, chunk]);
            this.remaining = undefined;
        } else this.chunk = chunk;

        let err: Error | undefined;

        if (this.state === WebmSeekerState.READING_HEAD) err = this.readHead();
        else if (!this.seekfound) err = this.getClosetCluster();
        else err = this.readTag();

        if (err) callback(err);
        else callback();
    }

    private readHead(): Error | undefined {
        if (!this.chunk) return new Error('Chunk is missing');

        while (this.chunk.length > this.cursor) {
            const oldCursor = this.cursor;
            const id = this.vint_length;
            if (this.chunk.length < this.cursor + id) break;

            const ebmlID = this.parseEbmlID(this.chunk.slice(this.cursor, this.cursor + id).toString('hex'));
            this.cursor += id;
            const vint = this.vint_value;

            if (!vint) {
                this.cursor = oldCursor;
                break;
            }
            if (!ebmlID) {
                this.cursor += this.data_size + this.data_length;
                continue;
            }

            if (!this.headfound) {
                if (ebmlID.name === 'ebml') this.headfound = true;
                else return new Error('Failed to find EBML ID at start of stream.');
            }
            const data = this.chunk.slice(
                this.cursor + this.data_size,
                this.cursor + this.data_size + this.data_length
            );
            const parse = this.header.parse(ebmlID, data);
            if (parse instanceof Error) return parse;

            if (ebmlID.type === DataType.master) {
                this.cursor += this.data_size;
                continue;
            }

            if (this.chunk.length < this.cursor + this.data_size + this.data_length) {
                this.cursor = oldCursor;
                break;
            } else this.cursor += this.data_size + this.data_length;
        }
        this.remaining = this.chunk.slice(this.cursor);
        this.cursor = 0;
    }

    private readTag(): Error | undefined {
        if (!this.chunk) return new Error('Chunk is missing');

        while (this.chunk.length > this.cursor) {
            const oldCursor = this.cursor;
            const id = this.vint_length;
            if (this.chunk.length < this.cursor + id) break;

            const ebmlID = this.parseEbmlID(this.chunk.slice(this.cursor, this.cursor + id).toString('hex'));
            this.cursor += id;
            const vint = this.vint_value;

            if (!vint) {
                this.cursor = oldCursor;
                break;
            }
            if (!ebmlID) {
                this.cursor += this.data_size + this.data_length;
                continue;
            }

            const data = this.chunk.slice(
                this.cursor + this.data_size,
                this.cursor + this.data_size + this.data_length
            );
            const parse = this.header.parse(ebmlID, data);
            if (parse instanceof Error) return parse;

            if (ebmlID.type === DataType.master) {
                this.cursor += this.data_size;
                continue;
            }

            if (this.chunk.length < this.cursor + this.data_size + this.data_length) {
                this.cursor = oldCursor;
                break;
            } else this.cursor += this.data_size + this.data_length;

            if (ebmlID.name === 'simpleBlock') {
                if (this.time_left !== 0 && this.mode === 'precise') {
                    if (data.readUInt16BE(1) === this.time_left) this.time_left = 0;
                    else continue;
                }
                const track = this.header.segment.tracks![this.header.audioTrack];
                if (!track || track.trackType !== 2) return new Error('No audio Track in this webm file.');
                if ((data[0] & 0xf) === track.trackNumber) this.push(data.slice(4));
            }
        }
        this.remaining = this.chunk.slice(this.cursor);
        this.cursor = 0;
    }

    private getClosetCluster(): Error | undefined {
        if (!this.chunk) return new Error('Chunk is missing');
        const count = this.chunk.indexOf('1f43b675', 0, 'hex');
        if (count === -1) throw new Error('Failed to find nearest Cluster.');
        else this.chunk = this.chunk.slice(count);
        this.seekfound = true;
        return this.readTag();
    }

    private parseEbmlID(ebmlID: string) {
        if (Object.keys(WebmElements).includes(ebmlID)) return WebmElements[ebmlID];
        else return false;
    }

    _destroy(error: Error | null, callback: (error: Error | null) => void): void {
        this.cleanup();
        callback(error);
    }

    _final(callback: (error?: Error | null) => void): void {
        this.cleanup();
        callback();
    }
}
