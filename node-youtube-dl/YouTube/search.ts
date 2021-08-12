import { url_get } from "./utils/request";
import fs from 'fs'


export async function search(url:string, options? : {limit : number}) {
    let body = await url_get(url)
    let json_convert = body.split("var ytInitialData = ")[1].split(";</script>")[0]
    let result = JSON.parse(json_convert).contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
    console.log(result.length)
}