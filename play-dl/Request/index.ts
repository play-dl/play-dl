import { Response } from "./classes";


export type Proxy = ProxyOpts | string;

interface ProxyOpts {
    host: string;
    port: number;
    authentication?: {
        username: string;
        password: string;
    };
}

interface RequestOptions {
    body?: string;
    method: 'GET' | 'POST';
    proxies?: Proxy[];
    cookies? : boolean
    headers? : Object;
    timeout? : number
}

interface StreamGetterOptions{
    method: 'GET' | 'POST';
    cookies? : boolean
    headers : Object;
}

export function request_stream(req_url : string, options : RequestOptions = {method : "GET"}): Promise<Response>{
    return new Promise(async(resolve, reject) => {
        let res = new Response(req_url, options)
        await res.stream()
        if (res.statusCode >= 300 && res.statusCode < 400) {
            res = await request_stream((res.headers as any).location, options);
            await res.stream()
        }
        resolve(res)
    })
}

export function request(req_url : string, options : RequestOptions = {method : "GET"}): Promise<Response>{
    return new Promise(async(resolve, reject) => {
        let res = new Response(req_url, options)
        await res.fetch()
        if (Number(res.statusCode) >= 300 && Number(res.statusCode) < 400) {
            res = await request((res.headers as any).location, options);
        } else if (Number(res.statusCode) > 400) {
            reject(new Error(`Got ${res.statusCode} from the request`));
        }
        resolve(res)
    })
}