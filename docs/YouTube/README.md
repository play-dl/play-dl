# YouTube

## Basic Usage

```js
const youtube = require('play-dl');
// ES6: import youtube from 'play-dl';
const options = {
    limit : 1
}
const results = await youtube.search('post malone sunflower', options);
```

## Validate

### yt_validate(url : `string`)

_This will validate url and return type or boolean_

**Returns :** `video` | `playlist` | `false`

```js
let check = yt_validate(url)

if(!check) // Invalid URL

if(check === "video") //URL is video url

if(check === "playlist") //URL is a playlist url
```

## Extract ID

### extractID(url : `string`)

_This will return videoID or playlistID from a url_

**Note :** URL like [this](https://www.youtube.com/watch?v=E2gHczUOCGI&list=PLUt3leKZfbZqLzLwcQMYPBdbe7i7KRCOP&index=2) will return a playlist ID only.

```js
let id = extractID(url)
```

## Video

### InfoOptions

_This are the info options that can be passed as a parameter in `video_info` and `video_basic_info`_

-   cookie : **[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**
-   proxy : Optional parameter to add support of proxies. As of now, HTTPS proxies are only supported. So make sure to get HTTPS proxies only.

```js
const video = await video_basic_info(url, { cookie : "cookies" }) // Gives cookies support

const video = await video_basic_info(url, { proxy : ['url'] }) // Accepts a url which has port in it.

const video = await video_basic_info(url, {proxy : [{
        host : "IP or hostname",
        port : 8080
    }]
}) // Or add a json containing hostname and port.
```

### video_basic_info(url : `string`, options? : [`InfoOptions`](https://github.com/play-dl/play-dl/tree/main/docs/YouTube#infooptions))

_The basic video details `play-dl` fetches at first from url or videoID._

```js
const video = await video_basic_info(url)
```

### video_info(url : `string`, , options? : [`InfoOptions`](https://github.com/play-dl/play-dl/tree/main/docs/YouTube#infooptions))

_This contains everything with deciphered formats along with `video_details`. It can fetech data from url or videoID._

```js
const video = await video_info(url)
```

-   #### format `property`

    _This returns all the formats available for a video._

    ```js
    const video = await video_info(url)
    console.log(video.format)
    ```

## Playlist

### playlist_info(url : `string`, options : `PlaylistOptions`)

_This fetches all details about a playlist from a url or playlistID._

```js
const playlist = await playlist_info(url)
//This only fetches first 100 videos from a playlist

const playlist = await playlist_info(url, { incomplete : true })
//This only fetches first 100 videos from a playlist and also parses playlist with hidden videos

const playlist = await playlist_info(url, { proxy : [''] }) // Same 2 options as mentioned in InfoOptions
```

-   #### fetch() `method`

    _This fetches and returns all videos from the whole provided playlist ._

    ```js
    const playlist = await playlist_info(url)
    //This only fetches first 100 videos from a playlist

    await playlist.fetch()
    // This one fetches all videos from a playlist.
    ```

-   #### page(page_number : `number`)

    _This returns no. of videos from a page._

    > Every 100 videos have been divided into pages.
    > Example: There are 782 videos in a playlist, so there will be 8 pages.

    ```js
    const playlist = await playlist_info(url);
    // This only fetches first 100 videos from a playlist.

    await playlist.fetch();
    // This one fetches all videos from a playlist.

    console.log(playlist.page(1));
    // This displays first 100 videos of a playlist

    ```

-   #### total_pages `property`

    _This returns total no. of pages that have been fetched so far._

    ```js
    const playlist = await playlist_info(url)
    //This only fetches first 100 videos from a playlist.

    await playlist.fetch()
    // This one fetches all videos from a playlist.

    console.log(playlist.total_pages)
    // This displays total no. of pages fetched so far.

    for(let i = 1; i <= playlist.total_pages; i++){
        queue.push(...playlist.page(i))
    } // This will push every video in that playlist to your queue
    ```

-   #### total_videos `property`

    _This returns total no. of videos that have been fetched so far._

    ```js
    const playlist = await playlist_info(url)
    //This only fetches first 100 videos from a playlist.

    await playlist.fetch()
    // This one fetches all videos from a playlist.

    console.log(playlist.total_videos)
    // This displays total no. of videos fetched so far.
    ```

-   #### videoCount `property`

    _This returns total no. of videos in the provided playlist._

    ```js
    const playlist = await playlist_info(url)
    //This only fetches first 100 videos from a playlist.

    await playlist.fetch()
    // This one fetches all videos from a playlist.

    console.log(playlist.videoCount)
    // This displays total no. of videos in a playlist.
    ```
