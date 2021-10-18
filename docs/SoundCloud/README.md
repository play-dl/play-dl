# SoundCloud

## Main

### soundcloud(url : `string`)

_This returns data from a track | playlist url._

```js
let data = await soundcloud(url) //Gets the data

console.log(data.type) // Console logs the type of data that you got.
```

### getFreeClientID()

_This returns free client ID._

```js 
const client_id = await getFreeClientID()

setToken({
    soundcloud : {
        client_id : client_id
    }
}) // This will set client ID for use in play-dl.
```

## Validate

### so_validate(url : `string`)

_This checks that given url is soundcloud url or not._

**Returns :** `track` | `playlist` | `search` | `false`

```js
let check = await so_validate(url)

if(!check) // Invalid SoundCloud URL

if(check === 'track') // SoundCloud Track URL

if(check === "search") // Given term is not a SoundCloud URL. Search this somewhere.
```

## Classes [ Returned by `soundcloud(url)` function ]

### SoundCloudTrack

_This is class for a soundcloud track._

##### type `property`

_This will always return as "track" for this class._

##### toJSON() `function`

_converts class into a json format_

### SoundCloudPlaylist

_This is a soundcloud playlist class._

##### fetch() `function`

_This will fetch tracks in a playlist._

```js
let data = await soundcloud(playlist_url)

await data.fetch() // Fetches all unfetched tracks in playlist
```

##### tracksCount `property`

_This will give no. of tracks in a playlist._

```js
let data = await soundcloud(playlist_url)

console.log(data.tracksCount) // Returns total tracks count in a playlist
```

#### tracks `property`

_This will give all tracks fetched as array._

```js
let data = await soundcloud(playlist_url)

console.log(data.tracks) // Tracks Array

data.tracks.forEach((track) => {
    queue.push(track) // This will push every track in playlist to your queue
})
```

#### total_tracks `property`

_This give total videos that have been fetched so far._

```js
let data = await soundcloud(playlist_url)

console.log(data.total_tracks) // This will tell no. of videos that have been fetched so far.
```

##### type `property`

_This will always return as "playlist" for this class._

##### toJSON() `function`

_converts class into a json format_
