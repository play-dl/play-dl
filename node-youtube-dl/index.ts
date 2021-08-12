import { search } from "./YouTube/";

let main = async() => {
    let time_start = Date.now()
    await search('https://www.youtube.com/results?search_query=Hello+Neghibour')
    let time_end = Date.now()
    console.log(`Time Taken : ${(time_end - time_start)/1000} seconds`)
}

main()