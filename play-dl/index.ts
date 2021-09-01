export { playlist_info, video_basic_info, video_info, search, stream, stream_from_info, validate, validate_playlist } from "./YouTube";

import { video_basic_info } from '.'

(async() => {
    let vid = await video_basic_info('https://www.youtube.com/watch?v=ALZHF5UqnU4')
})()