import fetch, { RequestInit } from 'node-fetch'

export async function url_get (url : string, options? : RequestInit) : Promise<string>{
    return new Promise(async(resolve, reject) => {
        let response = await fetch(url, options)

        if(response.status === 200) {
            resolve(await response.text())
        }
        else reject(`Got ${response.status} from ${url}`)
    })
}