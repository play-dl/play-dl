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

# Validate

### validate( url : `string` )
 *Much faster and easier way to validate url.*
```js
if(validate(url)) // Will return true if url is a YouTube url 
```

### validate_playlist( url : `string` )
 *Much faster and easier way to validate url.*
```js
if(validate_playlist(url)) // Will return true if url is a YouTube Playlist url 
```

 > Want to Check both, use this
 ```js
if(validate(url) || validate_playlist(url)) // This will check both and if anyone is true, it will execute the below function
 ```

# Stream

### stream(url : `string`, cookie? : `string`)
*This is basic to create a youtube stream from a url.*
<<<<<<< HEAD
**Cookies are optional and are required for playing age restricted videos.**
=======

**[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**
>>>>>>> 4487ef38a991af12fb1660bc7ffe3cf7418433ca
```js
 let source = await stream("url") // This will create a stream Class which contains type and stream to be played.
 let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
```

### stream_from_info(info : `infoData`)
*This is basic to create a youtube stream from a info [ from [video_info](https://github.com/play-dl/play-dl#video_infourl--string) function ].*
```js
let info = await video_info("url")
 let source = await stream_from_info(info) // This will create a stream Class which contains type and stream to be played.
 let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
```

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

### video_basic_info(url : `string`, cookie? : `string`)
*The basic video details `play-dl` fetches at first.*
**Cookies are optional and are required for playing age restricted videos.**

**[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**

```js
const video = await video_basic_info(url)
```
### video_info(url : `string`, cookie? : `string`)
*This contains everything with deciphered formats along with `video_details`.*
**Cookies are optional and are required for playing age restricted videos.**

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
