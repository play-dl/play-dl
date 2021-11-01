# Play-dl commands

For source specific commands :-

-   [YouTube](https://github.com/play-dl/play-dl/tree/main/docs/YouTube#youtube)
-   [Spotify](https://github.com/play-dl/play-dl/tree/main/docs/Spotify#spotify)
-   [SoundCloud](https://github.com/play-dl/play-dl/tree/main/docs/SoundCloud)

### Validate

#### validate(url : `string`)

_This checks all type of urls that are supported by play-dl._

**Returns :** `so_playlist` | `so_track` | `sp_track` | `sp_album` | `sp_playlist` | `dz_track` | `dz_playlist` | `dz_album` | `yt_video` | `yt_playlist` | `search` | `false`

`so` = **SoundCloud**

`sp` = **Spotify**

`yt` = **YouTube**

`dz` = **Deezer**

```js
let check = await validate(url)

if(!check) // Invalid URL

if(check === 'yt_video') // YouTube Video

if(check === 'sp_track') // Spotify Track

if(check === 'so_track') // SoundCloud Track

if(check === 'dz_track') // Deezer Track

if(check === "search") // Given term is not a url. Search this term somewhere.
```

### authorization()

_This creates basic spotify / soundcloud / youtube data to be stored locally._

```js
authorization() //After then you will be asked about type of data you want to create and then follow the steps properly.
```

### setToken(options : `TokenOptions`)

_This sets token without using file._

```js
setToken({
    spotify : {
        client_id : "ID",
        client_secret : "Secret",
        refresh_token : "Token",
        market : "Country Code"
    }
}) // Setting Spotify Token [ To get refresh_token, just run through authorization, and set file save to No ]

setToken({
    soundcloud : {
        client_id : "ID"
    }
}) // Setting SoundCloud Token

setToken({
    youtube : {
        cookie : "Cookies"
    }
}) // Warning : Using setToken for youtube cookies will only update cookies present in memory only.
```

### Search

#### SearchOptions :

-   limit : `number` :- Sets total amount of results you want.
-   source : {

    youtube: `video` | `playlist` | `channel` ;

    spotify: `album` | `playlist` | `track` ;

    soundcloud: `tracks` | `playlists` | `albums` ;

    deezer: `track` | `playlist` | `album` ;

    }

#### search(query : `string`, options? : [`SearchOptions`](https://github.com/play-dl/play-dl/tree/main/docs#searchoptions-))

_This is basic to search with any source._

**NOTE :-** If options.source is not specified, then it will default to youtube video search.

```js
let data = await search('Rick Roll', { limit : 1 }) // Searches for youtube video

let data = await search('Rick Roll', { limit : 1, source : { youtube : "video" } }) // Searches for youtube video

let data = await search('Rick Roll', { limit: 1, source : { spotify : "track" } }) // Searches for spotify track.

let data = await search('Rick Roll', { limit: 1, source : { soundcloud : "tracks" } }) // Searches for soundcloud track.

let data = await search('Rick Roll', { limit: 1, source : { deezer : "track" } }) // Searches for a Deezer track.
```

### Stream

**Attaching events to player is important for stream to work.**

#### attachListeners(player : `AudioPlayer`, resource : `YouTubeStream | SoundCloudStream`)

_This is used for attaching pause and playing events to audioPlayer._

```js
let resource = await stream("url")

let player = createAudioPlayer()

attachListeners(player, resource)
```

#### StreamOptions :

-   quality : `number` :- Sets quality of stream [ 0 = Lowest, 1 = Medium ]. Leave this empty to get highest audio quality.
-   proxy : `Proxy` :- Optional parameter to add support of proxies. As of now, HTTPS proxies are only supported. So make sure to get HTTPS proxies only.

#### stream(url : `string`, options? : [`StreamOptions`](https://github.com/play-dl/play-dl/tree/main/docs#streamoptions-))

_This is basic to create a stream from a youtube or soundcloud url._

```js
let source = await stream("url") // This will create a stream Class. Highest Quality

let source = await stream("url", { quality : 0 }) // Lowest quality

let source = await stream("url", { quality : 1 }) // Next to Lowest quality.

let source = await stream(url, { proxy : ['url'] }) // Accepts a url which has port in it.

let source = await stream(url. {proxy : [{
        host : "IP or hostname",
        port : 8080
    }]
}) // Or add a json containing hostname and port.

let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
```

#### stream_from_info(info : `infoData`, options? : [`StreamOptions`](https://github.com/play-dl/play-dl/tree/main/docs#streamoptions-))

_This is basic to create a stream from a info [ from [video_info](https://github.com/play-dl/play-dl#video_infourl--string) function or [soundcloud](https://github.com/play-dl/play-dl/tree/main/docs/SoundCloud#soundcloudurl--string) function [**Only SoundCloudTrack class is allowed**] ]._

**Note :** Here, cookies are required only for retrying purposes.

```js
let source = await stream_from_info(info) // This will create a stream Class from video_info or SoundCoudTrack Class. Highest Quality

let source = await stream_from_info(info, { quality : 0 }) // Lowest quality

let source = await stream_from_info(info, { quality : 1 }) // Next to Lowest quality.

let source = await stream_from_info(info, { proxy : ['url'] }) // Accepts a url which has port in it.

let source = await stream_from_info(info, {proxy : [{
        host : "IP or hostname",
        port : 8080
    }]
}) // Or add a json containing hostname and port.

let resource = createAudioResource(source.stream, {
            inputType : source.type
        }) // This creates resource for playing
```

#### cookieHeaders(headersCookie : `string[]`)

_This is function to update youtube cookies when using external https module._

```js
const res = ... // You need to get response.

play.cookieHeaders(res.headers['set-cookie']) // Updates YouTube Cookies if cookies exists.
```