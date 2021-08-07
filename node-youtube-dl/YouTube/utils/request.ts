import fetch from 'node-fetch'

export async function get (url : string) : Promise<string>{
    return new Promise(async(resolve, reject) => {
        let response = await fetch(url)

        if(response.status === 200) resolve(await response.text())
        else reject(`Got ${response.status} from ${url}`)
    })
}
