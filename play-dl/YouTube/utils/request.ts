import https, { RequestOptions } from 'https'
import { IncomingMessage } from 'http'
import { URL } from 'url'

interface RequestOpts extends RequestOptions{
    body? : string;
    method? : "GET" | "POST"
}

async function https_getter(req_url : string, options : RequestOpts = {}): Promise<IncomingMessage>{
    return new Promise((resolve, reject) => {
        let s = new URL(req_url)
        options.method ??= "GET"
        let req_options : RequestOptions = {
            host : s.hostname,
            path : s.pathname + s.search,
            headers : options.headers ?? {},
            method : options.method
        }

        let req = https.request(req_options, (response) => {
            req.once('error', (err) => {
                reject(err)
            })
            resolve(response)
        })
        if(options.method === "POST") req.write(options.body)
        req.end()
        req.once('error', (err) => {
            reject(err)
        })
    })
}

export async function request(url : string, options? : RequestOpts): Promise<string>{
    return new Promise(async (resolve, reject) => {
        let data = ''
        let res = await https_getter(url, options)
        if(Number(res.statusCode) >= 300 && Number(res.statusCode) < 400){
            res = await https_getter(res.headers.location as string , options)
        }
        else if(Number(res.statusCode) > 400){
            reject(`Got ${res.statusCode} from the request`)
        }
        res.setEncoding('utf-8')
        res.on('data', (c) => data+=c)
        res.on('end', () => resolve(data))
    })
}

export async function request_stream(url : string, options? : RequestOpts): Promise<IncomingMessage>{
    return new Promise(async (resolve, reject) => {
        let res = await https_getter(url, options)
        if(Number(res.statusCode) >= 300 && Number(res.statusCode) < 400){
            res = await https_getter(res.headers.location as string, options)
        }
        resolve(res)
    })
}
