# YouTube Downloader/Search
### Downloades youtube videos, playlist and also searches song

This is a light-weight youtube downloader and searcher.

- searches by video, playlist, channel
- obtains audio playback url.

## Video commands usage :-
### 1. video_basic_info(url : `string`)
*This is what downloader gets first.*
```js
let video = await video_basic_info(url)
```
### 2. video_info(url : `string`)
*This contains everything with deciphered formats along with video_details.*
```js
let video = await video_info(url)
```
### 3. formats 
*This shows all formats availiable of a video*
```js
let video = await video_info(url)
console.log(video.format)
```

## Playlist commands usage :-
### 1. playlist_info(url : `string`)
*This containes every thing about a playlist*
```js
let playlist = await playlist_info(url) //This only fetches first 100 songs from a playlist
```

#### 2. playlist.fetch()
*This fetches whole playlist.*
```js
let playlist = await playlist_info(url) //This only fetches first 100 songs from a playlist

await playlist.fetch() // This one fetches all songs from a playlist.
```
#### 3. playlist.page(page_number : `number`)
*This gives you no. of videos from a page*
> Pages : every 100 songs have been divided into pages. 
> So for example: There are 782 songs in a playlist, so there will be 8 pages.

```js
let playlist = await playlist_info(url) //This only fetches first 100 songs from a playlist

await playlist.fetch() // This one fetches all songs from a playlist.

console.log(playlist.page(1)) // This displays first 100 songs of a playlist
```
#### 4. playlist.total_videos
*This tells you total no of videos that have been fetched so far.*
```js
let playlist = await playlist_info(url) //This only fetches first 100 songs from a playlist

await playlist.fetch() // This one fetches all songs from a playlist.

console.log(playlist.total_videos) // This displays total no. of videos fetched so far.
```
#### 5. playlist.videoCount
*This tells total no. of songs in a playlist.*
```js
let playlist = await playlist_info(url) //This only fetches first 100 songs from a playlist

await playlist.fetch() // This one fetches all songs from a playlist.

console.log(playlist.videoCount) // This displays total no. of videos in a playlist
```

## Search Command Usage :-
### 1. search(url : `string`, options? : `SearchOptions`)
*This enables all searching mechanism (video, channel, playlist)*
```js
let result = await search('Rick Roll')
console.log(result[0].url)
```
### SearchOptions 
```
type?: "video" | "playlist" | "channel" | "all";
limit?: number;
```
