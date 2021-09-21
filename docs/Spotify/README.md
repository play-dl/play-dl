# Spotify

## Main

### spotify(url : `string`)

_This returns data from a track | playlist | album url._

```js
let data = await spotify(url) //Gets the data

console.log(data.type) // Console logs the type of data that you got.
```

### is_expired()

_This tells that whether the access token is expired or not_

**Returns :** `boolean`

```js
if(is_expired()){
    await RefreshToken()
}
```

### refreshToken()

_This refreshes the access token._

**Returns :** `boolean` for telling whether access token is refreshed or not

```js
await refreshToken()
```

## Classes [ Returned by `spotify(url)` function ]

### SpotifyVideo

_Don't go by the name. This is class for a spotify track._

##### type `property`

_This will always return as "track" for this class._

##### toJSON() `function`

_converts class into a json format_

### SpotifyPlaylist

_This is a spotify playlist class._

##### fetch() `function`

_This will fetch tracks in a playlist upto 1000 tracks only._

```js
let data = await spotify(playlist_url)

await data.fetch() // Fetches tracks more than 100 tracks in playlist
```

##### tracksCount `property`

_This will give no. of tracks in a playlist._

```js
let data = await spotify(playlist_url)

console.log(data.tracksCount) // Returns total tracks count in a playlist
```

##### page(page_number : `number`)

_This will return array of tracks in that page._

> Same as youtube playlist pages

```js
let data = await spotify(playlist_url)

console.log(data.page(1)) //This will give first 100 tracks in playlist.
```

-   total_pages `property`

    _This give total pages that have been fetched so far._

    ```js
     let data = await spotify(playlist_url)

     console.log(data.total_pages) // This will tell no. of pages that have been fetched so far.

     for(let i = 1; i <= data.total_pages; i++){
         queue.push(data.page(i)) //This will push all tracks to your queue system
     }
    ```

-   total_tracks `property`

    _This give total videos that have been fetched so far._

    ```js
     let data = await spotify(playlist_url)

     console.log(data.total_tracks) // This will tell no. of videos that have been fetched so far.
    ```

##### type `property`

_This will always return as "playlist" for this class._

##### toJSON() `function`

_converts class into a json format_

### SpotifyAlbum

_This is a spotify albun class._

##### fetch() `function`

_This will fetch tracks in a album upto 500 tracks only._

```js
let data = await spotify(playlist_url)

await data.fetch() // Fetches tracks more than 50 tracks in album
```

##### tracksCount `property`

_This will give no. of tracks in a playlist._

```js
let data = await spotify(playlist_url)

console.log(data.tracksCount) // Returns total tracks count in a album
```

##### page(page_number : `number`)

_This will return array of tracks in that page._

> Same as youtube playlist pages

```js
let data = await spotify(playlist_url)

console.log(data.page(1)) //This will give first 50 tracks in album.
```

-   total_pages `property`

    _This give total pages that have been fetched so far._

    ```js
     let data = await spotify(playlist_url)

     console.log(data.total_pages) // This will tell no. of pages that have been fetched so far.

     for(let i = 1; i <= data.total_pages; i++){
         queue.push(data.page(i)) //This will push all tracks to your queue system
     }
    ```

-   total_tracks `property`

    _This give total videos that have been fetched so far._

    ```js
     let data = await spotify(playlist_url)

     console.log(data.total_tracks) // This will tell no. of videos that have been fetched so far.
    ```

##### type `property`

_This will always return as "album" for this class._

##### toJSON() `function`

_converts class into a json format_

## Validate

### sp_validate(url : `string`)

_This checks that given url is spotify url or not._

**Returns :** `track` | `album` | `playlist` | `false`

```js
let check = sp_validate(url)

if(!check) // Invalid Spotify URL

if(check === 'track') // Spotify Track URL
```
