const bot_token = process.env['BOT_TOKEN']
const { request } = require('https')

let tag = undefined, body = undefined, channel = undefined;

process.argv.forEach((arg) => {
    const [ key, value ] = arg.split('=')
    if(key === 'tag') tag = value
    if(key === 'body') body = value
    if(key === 'channel') channel = value
})

if(!tag || !body || !channel) {
    console.log(`Some args are missing`)
    process.exit(1)
}
else if(!bot_token) {
    console.log('Bot Token is missing')
    process.exit(1)
};

(async() => {
    const body_args = body.replaceAll('\r', '').split('- [x]')
    body_args.shift()
    body_args.unshift('**Change Log :-**\n')
    const description = body_args.join('\n<a:tick:893093621623037972>')
    const embed = {
        title : tag,
        url : `https://github.com/play-dl/play-dl/releases/tag/${tag}`,
        description : description,
        color : 0x00FF00
    }

    const payload = {
        embeds : [embed]
    }
    
    console.log(payload)

    const x = await https_getter(`https://discord.com/api/v9/channels/${channel}/messages`, {
        headers : {
            "Authorization" : `Bot ${bot_token}`,
            "content-type" : "application/json"
        },
        method : "POST",
        body : JSON.stringify(payload)
    })
    console.log(x.statusCode)
    process.exit(0)
})()

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

        const req = request(req_options, resolve);
        req.on('error', (err) => {
            reject(err);
        });
        if (options.method === 'POST') req.write(options.body);
        req.end();
    });
}