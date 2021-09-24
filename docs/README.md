# Play-dl commands

For source specific commands :-

-   [YouTube](https://github.com/play-dl/play-dl/tree/main/docs/YouTube#youtube)
-   [Spotify](https://github.com/play-dl/play-dl/tree/main/docs/Spotify#spotify)
-   [SoundCloud](https://github.com/play-dl/play-dl/tree/main/docs/SoundCloud)

### Validate

#### validate(url : `string`)

_This checks all type of urls that are supported by play-dl._

**Returns :** `so_playlist` | `so_track` | `sp_track` | `sp_album` | `sp_playlist` | `yt_video` | `yt_playlist` | `false`

`so` = **SoundCloud**

`sp` = **Spotify**

`yt` = **YouTube**

```js
let check = await validate(url)

if(!check) // Invalid URL

if(check === 'yt_video') // YouTube Video

if(check === 'sp_track') // Spotify Track

if(check === 'so_track') // SoundCloud Track
```

### authorization()

_This creates basic spotify / soundcloud data to be stored locally._

```js
authorization() //After then you will be asked about type of data you want to create and then follow the steps properly.
```

### Stream

### StreamOptions :

-   quality : `number` :- Sets quality of stream [ 0 = Lowest, 1 = Medium ]. Leave this empty to get highest audio quality.
-   cookie : `string` :- **[Cookies](https://github.com/play-dl/play-dl/discussions/34) are optional and are required for playing age restricted videos.**

#### stream(url : `string`, options? : `StreamOptions`)

_This is basic to create a stream from a youtube or soundcloud url._

```js
let source = await stream("url") // This will create a stream Class.

let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
```

#### stream_from_info(info : `infoData`, options? : `StreamOptions`)

_This is basic to create a stream from a info [ from [video_info](https://github.com/play-dl/play-dl#video_infourl--string) function or [soundcloud]() function [**Only SoundCloudTrack class is allowed**] ]._

**Note :** Here, cookies are required only for retrying purposes.

```js
 let source = await stream_from_info(info) // This will create a stream Class from video_info or SoundCoudTrack Class.

 /* OR
  let source = await stream_from_info(info, { cookie }) This will create a stream Class and also give cookies if retrying.
 */

 let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
```
