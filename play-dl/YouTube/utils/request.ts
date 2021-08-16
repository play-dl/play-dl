import got, { OptionsOfTextResponseBody } from 'got/dist/source'

export async function url_get (url : string, options? : OptionsOfTextResponseBody) : Promise<string>{
    return new Promise(async(resolve, reject) => {
        let response = await got(url, options)

        if(response.statusCode === 200) {
            resolve(response.body)
        }
        else reject(`Got ${response.statusCode} from ${url}`)
    })
}