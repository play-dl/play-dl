import fs from 'fs';
import { request } from '../YouTube/utils/request';
import { SoundCloudPlaylist, SoundCloudTrack } from './classes';

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

export async function check_id(id: string) {
    const response = await request(`https://api-v2.soundcloud.com/search?client_id=${id}&q=Rick+Roll&limit=0`).catch(
        (err: Error) => {
            return err;
        }
    );
    if (response instanceof Error) return false;
    else return true;
}
