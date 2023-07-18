/// <reference types="node" />
/// <reference types="node" />
import { WebmHeader } from 'play-audio';
import { Duplex, DuplexOptions } from 'node:stream';
export declare enum WebmSeekerState {
    READING_HEAD = "READING_HEAD",
    READING_DATA = "READING_DATA"
}
interface WebmSeekerOptions extends DuplexOptions {
    mode?: 'precise' | 'granular';
}
export declare class WebmSeeker extends Duplex {
    remaining?: Buffer;
    state: WebmSeekerState;
    chunk?: Buffer;
    cursor: number;
    header: WebmHeader;
    headfound: boolean;
    headerparsed: boolean;
    seekfound: boolean;
    private data_size;
    private offset;
    private data_length;
    private sec;
    private time;
    constructor(sec: number, options: WebmSeekerOptions);
    private get vint_length();
    private vint_value;
    cleanup(): void;
    _read(): void;
    seek(content_length: number): Error | number;
    _write(chunk: Buffer, _: BufferEncoding, callback: (error?: Error | null) => void): void;
    private readHead;
    private readTag;
    private getClosestBlock;
    private parseEbmlID;
    _destroy(error: Error | null, callback: (error: Error | null) => void): void;
    _final(callback: (error?: Error | null) => void): void;
}
export {};
//# sourceMappingURL=WebmSeeker.d.ts.map