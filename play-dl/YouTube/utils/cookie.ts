import fs from 'fs';

let youtubeData: youtubeDataOptions;
if (fs.existsSync('.data/youtube.data')) {
    youtubeData = JSON.parse(fs.readFileSync('.data/youtube.data').toString());
}

interface youtubeDataOptions {
    cookie?: Object;
}

export function getCookies(): undefined | string {
    let result = '';
    if (!youtubeData?.cookie) return undefined;
    for (const [key, value] of Object.entries(youtubeData.cookie)) {
        result += `${key}=${value};`;
    }
    return result;
}

export function setCookie(key: string, value: string): boolean {
    if (!youtubeData?.cookie) return false;
    key = key.trim();
    value = value.trim();
    Object.assign(youtubeData.cookie, { [key]: value });
    return true;
}

export function uploadCookie() {
    if (youtubeData) fs.writeFileSync('.data/youtube.data', JSON.stringify(youtubeData, undefined, 4));
}
