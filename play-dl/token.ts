import { setSoundCloudToken } from './SoundCloud';
import { setSpotifyToken } from './Spotify';
import { setCookieToken } from './YouTube/utils/cookie';

interface tokenOptions {
    spotify?: {
        client_id: string;
        client_secret: string;
        refresh_token: string;
        market: string;
    };
    soundcloud?: {
        client_id: string;
    };
    youtube?: {
        cookie: string;
    };
}

export function setToken(options: tokenOptions) {
    if (options.spotify) setSpotifyToken(options.spotify);
    if (options.soundcloud) setSoundCloudToken(options.soundcloud);
    if (options.youtube) setCookieToken(options.youtube);
}
