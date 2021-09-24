import fs from 'fs';
import { StreamType } from '../YouTube/stream';
import { request } from '../YouTube/utils/request';
import { SoundCloudPlaylist, SoundCloudTrack, SoundCloudTrackFormat, Stream } from './classes';

let soundData: SoundDataOptions;
if (fs.existsSync('.data/soundcloud.data')) {
    soundData = JSON.parse(fs.readFileSync('.data/soundcloud.data').toString());
}

interface SoundDataOptions {
    client_id: string;
}

const pattern = /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;

export async function soundcloud(url: string): Promise<SoundCloudTrack | SoundCloudPlaylist> {
    if (!soundData) throw new Error('SoundCloud Data is missing\nDid you forgot to do authorization ?');
    if (!url.match(pattern)) throw new Error('This is not a SoundCloud URL');

    const data = await request(
        `https://api-v2.soundcloud.com/resolve?url=${url}&client_id=${soundData.client_id}`
    ).catch((err: Error) => err);

    if (data instanceof Error) throw data;

    const json_data = JSON.parse(data);

    if (json_data.kind !== 'track' && json_data.kind !== 'playlist')
        throw new Error('This url is out of scope for play-dl.');

    if (json_data.kind === 'track') return new SoundCloudTrack(json_data);
    else return new SoundCloudPlaylist(json_data, soundData.client_id);
}

export async function so_search(
    query: string,
    type: 'tracks' | 'playlists' | 'albums',
    limit: number = 10
): Promise<(SoundCloudPlaylist | SoundCloudTrack)[]> {
    const response = await request(
        `https://api-v2.soundcloud.com/search/${type}?q=${query}&client_id=${soundData.client_id}&limit=${limit}`
    );
    const results: (SoundCloudPlaylist | SoundCloudTrack)[] = [];
    const json_data = JSON.parse(response);
    json_data.collection.forEach((x: any) => {
        if (type === 'tracks') results.push(new SoundCloudTrack(x));
        else results.push(new SoundCloudPlaylist(x, soundData.client_id));
    });
    return results;
}

export async function stream(url: string, quality?: number): Promise<Stream> {
    const data = await soundcloud(url);

    if (data instanceof SoundCloudPlaylist) throw new Error("Streams can't be created from Playlist url");

    const HLSformats = parseHlsFormats(data.formats);
    if (typeof quality !== 'number') quality = HLSformats.length - 1;
    else if (quality <= 0) quality = 0;
    else if (quality >= HLSformats.length) quality = HLSformats.length - 1;
    const req_url = HLSformats[quality].url + '?client_id=' + soundData.client_id;
    const s_data = JSON.parse(await request(req_url));
    const type = HLSformats[quality].format.mime_type.startsWith('audio/ogg')
        ? StreamType.OggOpus
        : StreamType.Arbitrary;
    return new Stream(s_data.url, type);
}

export async function stream_from_info(data: SoundCloudTrack, quality?: number): Promise<Stream> {
    const HLSformats = parseHlsFormats(data.formats);
    if (typeof quality !== 'number') quality = HLSformats.length - 1;
    else if (quality <= 0) quality = 0;
    else if (quality >= HLSformats.length) quality = HLSformats.length - 1;
    const req_url = HLSformats[quality].url + '?client_id=' + soundData.client_id;
    const s_data = JSON.parse(await request(req_url));
    const type = HLSformats[quality].format.mime_type.startsWith('audio/ogg')
        ? StreamType.OggOpus
        : StreamType.Arbitrary;
    return new Stream(s_data.url, type);
}

export async function check_id(id: string): Promise<boolean> {
    const response = await request(`https://api-v2.soundcloud.com/search?client_id=${id}&q=Rick+Roll&limit=0`).catch(
        (err: Error) => {
            return err;
        }
    );
    if (response instanceof Error) return false;
    else return true;
}

export async function so_validate(url: string): Promise<false | 'track' | 'playlist'> {
    const data = await request(
        `https://api-v2.soundcloud.com/resolve?url=${url}&client_id=${soundData.client_id}`
    ).catch((err: Error) => err);

    if (data instanceof Error) throw data;

    const json_data = JSON.parse(data);
    if (json_data.kind === 'track') return 'track';
    else if (json_data.kind === 'playlist') return 'playlist';
    else return false;
}

function parseHlsFormats(data: SoundCloudTrackFormat[]) {
    const result: SoundCloudTrackFormat[] = [];
    data.forEach((format) => {
        if (format.format.protocol === 'hls') result.push(format);
    });
    return result;
}
