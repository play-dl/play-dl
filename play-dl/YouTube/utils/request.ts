import got, { OptionsOfTextResponseBody } from 'got/dist/source'

export async function url_get (url : string, options? : OptionsOfTextResponseBody) : Promise<string>{
    let response = await got(url, options)
    if(response.statusCode === 200) {
        return response.body
    }
    else throw `Got ${response.statusCode} from ${url}`
}