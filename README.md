# Why play-dl ?

[ytdl-core](https://github.com/fent/node-ytdl-core) has some issues with miniget and also stream abort issues. On the other hand, [youtube-dl](https://github.com/ytdl-org/youtube-dl) is a very perfect alternative but it takes time to launch. Hence, play-dl is created to avoid these issues along with providing comparatively faster performance than others.

### Download videos/playlists or search for videos

This is a **light-weight** youtube downloader and searcher.

- searches by video, playlist, channel
- obtains audio playback url

### Installation

```bash
npm install play-dl@latest
```

### Examples

For pre-made examples, head over to [/examples](https://github.com/play-dl/play-dl/tree/main/examples) folder.



# Basic Usage

```js
const youtube = require('play-dl');
// ES6: import youtube from 'play-dl';
const options = {
    limit : 1
}
const results = await youtube.search('post malone sunflower', options);
```

# Stream
### stream(url : `string`, error_check? : `boolean`)
*This is basic to create a youtube stream from a url.*
```js
 let source = await stream(<url>) // This will create a stream Class which contains type and stream to be played.
 let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
        
let source = await stream(<url>, true) //This will check for 404 error if any
```
![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+) `Note : enabling error_check will take more time to start streaming`

### stream_from_info(info : `infoData`, error_check? : `boolean`)
*This is basic to create a youtube stream from a info [ from video_info function ].*
```js
let info = await video_info(<url>)
 let source = await stream_from_info(info) // This will create a stream Class which contains type and stream to be played.
 let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
        
let source = await stream_from_info(info, true) //This will check for 404 error if any
```
![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+) `Note : enabling error_check will take more time to start streaming`

# Search

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



# Video

### video_basic_info(url : `string`)
*The basic video details `play-dl` fetches at first.*

```js
const video = await video_basic_info(url)
```
### video_info(url : `string`)
*This contains everything with deciphered formats along with `video_details`.*

```js
const video = await video_info(url)
```
- #### format `property`
  *This returns all the formats available for a video.*

  ```js
  const video = await video_info(url)
  console.log(video.format)
  ```

  

# Playlist

### playlist_info(url : `string`, parseIncomplete : `boolean`)
*This fetches all details about a playlist.*

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
