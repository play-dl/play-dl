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
*This will validate url and return type or boolean*

**Returns :** `video` | `playlist` | `false`
```js
let check = yt_validate(url)

if(!check) // Invalid URL

if(check === "video") //URL is video url

if(check === "playlist") //URL is a playlist url
```

## Extract ID

### extractID(url : `string`)
*This will return videoID or playlistID from a url*

**Note :** URL like [this](https://www.youtube.com/watch?v=E2gHczUOCGI&list=PLUt3leKZfbZqLzLwcQMYPBdbe7i7KRCOP&index=2) will return a playlist ID only.

```js
let id = extractID(url)
```

## Stream

### stream(url : `string`, options : [StreamOptions](https://github.com/play-dl/play-dl/tree/main/docs/YouTube#streamoptions))
*This is basic to create a youtube stream from a url or videoID.*


```js
 let source = await stream("url") // This will create a stream Class which contains type and stream to be played.

 let source = await stream("url", {
   cookie : "Your Cookie",
   retry : true
 }) //This will enable cookies and also prevent 403 Errors from happening.
 let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
```

### stream_from_info(info : `infoData`, options : [StreamOptions](https://github.com/play-dl/play-dl/tree/main/docs/YouTube#streamoptions))
*This is basic to create a youtube stream from a info [ from [video_info](https://github.com/play-dl/play-dl#video_infourl--string) function ].*
```js
let info = await video_info("url")
 let source = await stream_from_info(info) // This will create a stream Class which contains type and stream to be played.
 let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
```

#### StreamOptions
  - **cookie** : `string`
  - **retry** : `boolean`

**NOTE :** Setting retry to true will cause performance decrease in stream starting.

**[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**

## Search

### search(url : `string`, options? : [SearchOptions](https://github.com/play-dl/play-dl/tree/main/play-dl/YouTube#searchoptions))

*This enables all searching mechanism (video, channel, playlist)*

```js
const options = {
    limit : 1
}
const results = await youtube.search('never gonna give you up', options);
console.log(results[0].url);
```

- #### SearchOptions 
  - *type* : `video` | `channel` | `playlist`
  - *limit* : `integer`



## Video

### video_basic_info(url : `string`, cookie? : `string`)
*The basic video details `play-dl` fetches at first from url or videoID.*

**[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**

```js
const video = await video_basic_info(url)
```
### video_info(url : `string`, cookie? : `string`)
*This contains everything with deciphered formats along with `video_details`. It can fetech data from url or videoID.*

**[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**

```js
const video = await video_info(url)
```
- #### format `property`
  *This returns all the formats available for a video.*

  ```js
  const video = await video_info(url)
  console.log(video.format)
  ```

  

## Playlist

### playlist_info(url : `string`, parseIncomplete : `boolean`)
*This fetches all details about a playlist from a url or playlistID.*

**parseIncomplete** is optional parameter if you want to parse playlist with hidden videos.
```js
const playlist = await playlist_info(url)
//This only fetches first 100 videos from a playlist

const playlist = await playlist_info(url, true)
//This only fetches first 100 videos from a playlist and also parses playlist with hidden videos
```

- #### fetch() `method`
  *This fetches and returns all videos from the whole provided playlist .*

  ```js
  const playlist = await playlist_info(url)
  //This only fetches first 100 videos from a playlist
  
  await playlist.fetch()
  // This one fetches all videos from a playlist.
  ```

- #### page(page_number : `number`)

  *This returns no. of videos from a page.*

  > Every 100 videos have been divided into pages. 
  > Example: There are 782 videos in a playlist, so there will be 8 pages.

  ```js
  const playlist = await playlist_info(url);
  // This only fetches first 100 videos from a playlist.
  
  await playlist.fetch();
  // This one fetches all videos from a playlist.
  
  console.log(playlist.page(1));
  // This displays first 100 videos of a playlist

- #### total_pages `property`
  *This returns total no. of pages that have been fetched so far.*

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

- #### total_videos `property`
  *This returns total no. of videos that have been fetched so far.*

  ```js
  const playlist = await playlist_info(url)
  //This only fetches first 100 videos from a playlist.
  
  await playlist.fetch()
  // This one fetches all videos from a playlist.
  
  console.log(playlist.total_videos)
  // This displays total no. of videos fetched so far.
  ```

- #### videoCount `property`

  *This returns total no. of videos in the provided playlist.*

  ```js
  const playlist = await playlist_info(url)
  //This only fetches first 100 videos from a playlist.
  
  await playlist.fetch()
  // This one fetches all videos from a playlist.
  
  console.log(playlist.videoCount)
  // This displays total no. of videos in a playlist.
  ```
