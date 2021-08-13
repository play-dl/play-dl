import { playlist_info } from "./YouTube";

let main = async() => {
    let time_start = Date.now()
    let playlist = await playlist_info('https://www.youtube.com/watch?v=bM7SZ5SBzyY&list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq')
    let time_end = Date.now()
    console.log(`Time Taken : ${(time_end - time_start)/1000} seconds`)
}

main()