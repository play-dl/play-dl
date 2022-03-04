import { DeezerImage } from './Track';

export class DeezerArtist {
    id: number;
    name: string;
    url: string;
    picture?: DeezerImage;
    role?: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.url = data.link ? data.link : `https://www.deezer.com/artist/${data.id}/`;

        if (data.picture_xl)
            this.picture = {
                xl: data.picture_xl,
                big: data.picture_big,
                medium: data.picture_medium,
                small: data.picture_small
            };

        if (data.role) this.role = data.role;
    }
}
