# Deezer

## Main

### deezer(url : `string`)

_This returns data from a track | playlist | album url. Accepts share links as well, which it resolves first._

```js
let data = await deezer(url); //Gets the data

console.log(data.type); // Console logs the type of data that you got.
```

## Validate

### dz_validate(url : `string`)

_This checks that given url is Deezer url or not._

**Returns :** `track` | `album` | `playlist` | `search` | `false`

```js
let check = dz_validate(url)

if(!check) // Invalid Deezer URL

if(check === 'track') // Deezer Track URL

if(check === "search") // Given term is a search query. Search it somewhere.
```

## Search

### dz_search(query: `string`, options: `DeezerSearchOptions`)

_Searches for tracks, playlists and albums._

**Returns :** `Deezer[]` an array of tracks, playlists or albums

#### `DeezerSearchOptions`

-   **type?** `'track'` | `'playlist'` | `'album'` The type to search for. Defaults to `'track'`.
-   **limit?** `number` The maximum number of results to return. Maximum `100`, defaults to `10`.
-   **fuzzy?** `boolean` Whether the search should be fuzzy or only return exact matches. Defaults to `true`.

```js
const results = await dz_search(query, {
    limit: 1,
    type: 'track',
    fuzzy: false
}); // Returns an array with one track, using exact matching
```

## Classes [ Returned by `deezer(url)` function ]

### DeezerTrack

_This is the class for a Deezer track._

##### type `property`

_This will always return as "track" for this class._

##### partial `property`

_Will return true for tracks in search results and false for tracks fetched directly or if the fetch function has been called. This being true means that the optional properties are undefined._

##### toJSON() `function`

_Converts the object to JSON_

##### fetch() `function`

_Fetches the missing data for a partial track._

```js
const track = await deezer(track_url);

await track.fetch() // Fetches the missing data
```

### DeezerPlaylist

_This is the class for a Deezer playlist._

##### fetch() `function`

_This will fetch up to 1000 tracks in a playlist as well as the missing data for a partial playlist._

```js
let data = await deezer(playlist_url)

await data.fetch() // Fetches tracks more than 100 tracks in playlist
```

##### tracksCount `property`

_This will return the total number of tracks in a playlist._

```js
const data = await deezer(playlist_url)

console.log(data.tracksCount) // Total number of tracks in the playlist.
```

##### type `property`

_This will always return as "playlist" for this class._

##### partial `property`

_Will return true for playlists in search results and false for playlists fetched directly or if the fetch function has been called. This being true means that the optional properties are undefined and `tracks` may be empty or partially filled._

##### tracks `property`

_The array of tracks in this album, this is always empty (length of 0) for partial playlists._

```js
const data = await deezer(playlist_url);

if (data.tracks.length !== data.tracksCount) {
    await data.fetch();
}

console.log(data.tracks); // returns all tracks in the playlist
```

##### toJSON() `function`

_Converts the object to JSON_

### DeezerAlbum

_This is the class for a Deezer album._

##### type `property`

_This will always return as "track" for this class._

##### tracks `property`

_The array of tracks in this album, this is always empty (length of 0) for partial albums._

##### partial `property`

_Will return true for albums in search results and false for albums fetched directly or if the fetch function has been called. This being true means that the optional properties are undefined._

##### toJSON() `function`

_Converts the object to JSON_

##### fetch() `function`

_Fetches the missing data for a partial album._
