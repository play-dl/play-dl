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

### video_basic_info(url : `string`, cookie? : `string`)

_The basic video details `play-dl` fetches at first from url or videoID._

**[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**

```js
const video = await video_basic_info(url)
```

### video_info(url : `string`, cookie? : `string`)

_This contains everything with deciphered formats along with `video_details`. It can fetech data from url or videoID._

**[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**

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

### playlist_info(url : `string`, parseIncomplete : `boolean`)

_This fetches all details about a playlist from a url or playlistID._

**parseIncomplete** is optional parameter if you want to parse playlist with hidden videos.

```js
const playlist = await playlist_info(url)
//This only fetches first 100 videos from a playlist

const playlist = await playlist_info(url, true)
//This only fetches first 100 videos from a playlist and also parses playlist with hidden videos
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
