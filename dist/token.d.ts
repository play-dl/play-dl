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
    useragent?: string[];
}
/**
 * Sets
 *
 *  i> YouTube :- cookies.
 *
 *  ii> SoundCloud :- client ID.
 *
 *  iii> Spotify :- client ID, client secret, refresh token, market.
 *
 *  iv> Useragents :- array of string.
 *
 * locally in memory.
 *
 * Example :
 * ```ts
 * play.setToken({
 *      youtube : {
 *          cookie : "Your Cookies"
 *      }
 * }) // YouTube Cookies
 *
 * await play.setToken({
 *      spotify : {
 *          client_id: 'ID',
            client_secret: 'secret',
            refresh_token: 'token',
            market: 'US'
 *      }
 * }) // Await this only when setting data for spotify
 *
 * play.setToken({
 *      useragent: ['Your User-agent']
 * }) // Use this to avoid 429 errors.
 * ```
 * @param options {@link tokenOptions}
 */
export declare function setToken(options: tokenOptions): Promise<void>;
export {};
//# sourceMappingURL=token.d.ts.map