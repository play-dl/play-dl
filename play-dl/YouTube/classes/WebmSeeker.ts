import { WebmElements, WebmHeader } from 'play-audio';
import { Duplex, DuplexOptions } from 'node:stream';

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

const WEB_ELEMENT_KEYS = Object.keys(WebmElements);

export class WebmSeeker extends Duplex {
    remaining?: Buffer;
    state: WebmSeekerState;
    chunk?: Buffer;
    cursor: number;
    header: WebmHeader;
    headfound: boolean;
    headerparsed: boolean;
    seekfound: boolean;
    private data_size: number;
    private offset: number;
    private data_length: number;
    private sec: number;
    private time: number;

    constructor(sec: number, options: WebmSeekerOptions) {
        super(options);
        this.state = WebmSeekerState.READING_HEAD;
        this.cursor = 0;
        this.header = new WebmHeader();
        this.headfound = false;
        this.headerparsed = false;
        this.seekfound = false;
        this.data_length = 0;
        this.data_size = 0;
        this.offset = 0;
        this.sec = sec;
        this.time = Math.floor(sec / 10) * 10;
    }

    private get vint_length(): number {
        let i = 0;
        for (; i < 8; i++) {
            if ((1 << (7 - i)) & this.chunk![this.cursor]) break;
        }
        return ++i;
    }

    private vint_value(): boolean {
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

    seek(content_length: number): Error | number {
        let clusterlength = 0,
            position = 0;
        let time_left = (this.sec - this.time) * 1000 || 0;
        time_left = Math.round(time_left / 20) * 20;
        if (!this.header.segment.cues) return new Error('Failed to Parse Cues');

        for (let i = 0; i < this.header.segment.cues.length; i++) {
            const data = this.header.segment.cues[i];
            if (Math.floor((data.time as number) / 1000) === this.time) {
                position = data.position as number;
                clusterlength = (this.header.segment.cues[i + 1]?.position || content_length) - position - 1;
                break;
            } else continue;
        }
        if (clusterlength === 0) return position;
        return this.offset + Math.round(position + (time_left / 20) * (clusterlength / 500));
    }

    _write(chunk: Buffer, _: BufferEncoding, callback: (error?: Error | null) => void): void {
        if (this.remaining) {
            this.chunk = Buffer.concat([this.remaining, chunk]);
            this.remaining = undefined;
        } else this.chunk = chunk;

        let err: Error | undefined;

        if (this.state === WebmSeekerState.READING_HEAD) err = this.readHead();
        else if (!this.seekfound) err = this.getClosestBlock();
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

            if (!this.vint_value()) {
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

            // stop parsing the header once we have found the correct cue

            if (ebmlID.name === 'seekHead') this.offset = oldCursor;

            if (
                ebmlID.name === 'cueClusterPosition' &&
                this.header.segment.cues!.length > 2 &&
                this.time === (this.header.segment.cues!.at(-2)!.time as number) / 1000
            )
                this.emit('headComplete');

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

            if (!this.vint_value()) {
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
                const track = this.header.segment.tracks![this.header.audioTrack];
                if (!track || track.trackType !== 2) return new Error('No audio Track in this webm file.');
                if ((data[0] & 0xf) === track.trackNumber) this.push(data.slice(4));
            }
        }
        this.remaining = this.chunk.slice(this.cursor);
        this.cursor = 0;
    }

    private getClosestBlock(): Error | undefined {
        if (this.sec === 0) {
            this.seekfound = true;
            return this.readTag();
        }
        if (!this.chunk) return new Error('Chunk is missing');
        this.cursor = 0;
        let positionFound = false;
        while (!positionFound && this.cursor < this.chunk.length) {
            this.cursor = this.chunk.indexOf('a3', this.cursor, 'hex');
            if (this.cursor === -1) return new Error('Failed to find nearest Block.');
            this.cursor++;
            if (!this.vint_value()) return new Error('Failed to find correct simpleBlock in first chunk');
            if (this.cursor + this.data_length + this.data_length > this.chunk.length) continue;
            const data = this.chunk.slice(
                this.cursor + this.data_size,
                this.cursor + this.data_size + this.data_length
            );
            const track = this.header.segment.tracks![this.header.audioTrack];
            if (!track || track.trackType !== 2) return new Error('No audio Track in this webm file.');
            if ((data[0] & 0xf) === track.trackNumber) {
                this.cursor += this.data_size + this.data_length;
                this.push(data.slice(4));
                positionFound = true;
            } else continue;
        }
        if (!positionFound) return new Error('Failed to find nearest correct simple Block.');
        this.seekfound = true;
        return this.readTag();
    }

    private parseEbmlID(ebmlID: string) {
        if (WEB_ELEMENT_KEYS.includes(ebmlID)) return WebmElements[ebmlID];
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
