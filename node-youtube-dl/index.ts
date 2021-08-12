import { yt_deciphered_data } from "./YouTube/utils/extractor";

let main = async() => {
    let time_start = Date.now()
    await yt_deciphered_data('https://www.youtube.com/watch?v=jbMHA3P7RzU')
    let time_end = Date.now()
    console.log(`Time Taken : ${(time_end - time_start)/1000} seconds`)
}

main()