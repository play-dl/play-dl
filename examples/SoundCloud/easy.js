const https = require('https')
const play = require('play-dl');

(async() => {
    let data = await request('https://soundcloud.com/')
    let splitted = data.split('<script crossorigin src="')
    let urls = []
    splitted.forEach((r) => {
        if(r.startsWith('https')) {
            urls.push(r.split('"')[0])
        }
    })
    let data2 = await request(urls[urls.length - 1])
    let client_id = data2.split(',client_id:"')[1].split('"')[0]
    console.log('Free SoundCloud Client ID : ' + client_id)
    play.authorization()
})();

function https_getter(req_url, options = {}) {
    return new Promise((resolve, reject) => {
        const s = new URL(req_url);
        options.method ??= 'GET';
        const req_options = {
            host: s.hostname,
            path: s.pathname + s.search,
            headers: options.headers ?? {},
            method: options.method
        };

        const req = https.request(req_options, resolve);
        req.on('error', (err) => {
            reject(err);
        });
        if (options.method === 'POST') req.write(options.body);
        req.end();
    });
}

async function request(url, options){
    return new Promise(async (resolve, reject) => {
        let data = '';
        let res = await https_getter(url, options).catch((err) => err);
        if (res instanceof Error) {
            reject(res);
            return;
        }
        if (Number(res.statusCode) >= 300 && Number(res.statusCode) < 400) {
            res = await https_getter(res.headers.location, options);
        } else if (Number(res.statusCode) > 400) {
            reject(new Error(`Got ${res.statusCode} from the request`));
        }
        res.setEncoding('utf-8');
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
    });
}