# Spotify

## Main
### spotify(url : `string`)
*This returns data from a track | playlist | album url.*

```js
let data = await spotify(url) //Gets the data

console.log(data.type) // Console logs the type of data that you got.
```

### Authorization()
*This creates basic spotify data to be stored locally.*

```js
Authorization() //After then you will be asked client-id, client-secret, redirect url, market, redirected URL.
```

### is_expired()
*This tells that whether the access token is expired or not*

**Returns :** `boolean`

```js
if(is_expired()){
    await RefreshToken()
}
```

### RefreshToken()
*This refreshes the access token.*

**Returns :** `boolean` for telling whether access token is refreshed or not

```js
await RefreshToken()
```

## Classes [ Returned by spotify() function ]
### SpotifyVideo
*Don't go by the name. This is class for a spotify track.*

##### type `property`
*This will always return as "track" for this class.*

##### toJSON() `function`
*converts class into a json format*

### SpotifyPlaylist
*This is a spotify playlist class.*

##### fetch() `function`
*This will fetch tracks in a playlist upto 1000 tracks only.*

```js
let data = await spotify(playlist_url)

await data.fetch() // Fetches tracks more than 100 tracks in playlist
```

##### tracksCount `property`
*This will give no. of tracks in a playlist.*

```js
let data = await spotify(playlist_url)

console.log(data.tracksCount) // Returns total tracks count in a playlist
```
##### page(page_number : `number`)
*This will return array of tracks in that page.*

> Same as youtube playlist pages

```js
let data = await spotify(playlist_url)

console.log(data.page(1)) //This will give first 100 tracks in playlist.
```
 - total_pages `property`
 
   *This give total pages that have been fetched so far.*
   ```js
    let data = await spotify(playlist_url)

    console.log(data.total_pages) // This will tell no. of pages that have been fetched so far.
    
    for(let i = 1; i <= data.total_pages; i++){
        queue.push(data.page(i)) //This will push all tracks to your queue system
    }
   ```
 - total_tracks `property`
 
   *This give total videos that have been fetched so far.*
    ```js
     let data = await spotify(playlist_url)

     console.log(data.total_tracks) // This will tell no. of videos that have been fetched so far.
    ```

##### type `property`
*This will always return as "playlist" for this class.*

##### toJSON() `function`
*converts class into a json format*

### SpotifyAlbum
*This is a spotify albun class.*

##### fetch() `function`
*This will fetch tracks in a album upto 500 tracks only.*

```js
let data = await spotify(playlist_url)

await data.fetch() // Fetches tracks more than 50 tracks in album
```

##### tracksCount `property`
*This will give no. of tracks in a playlist.*

```js
let data = await spotify(playlist_url)

console.log(data.tracksCount) // Returns total tracks count in a album
```
##### page(page_number : `number`)
*This will return array of tracks in that page.*

> Same as youtube playlist pages

```js
let data = await spotify(playlist_url)

console.log(data.page(1)) //This will give first 50 tracks in album.
```
 - total_pages `property`
 
   *This give total pages that have been fetched so far.*
   ```js
    let data = await spotify(playlist_url)

    console.log(data.total_pages) // This will tell no. of pages that have been fetched so far.
    
    for(let i = 1; i <= data.total_pages; i++){
        queue.push(data.page(i)) //This will push all tracks to your queue system
    }
   ```
 - total_tracks `property`
 
   *This give total videos that have been fetched so far.*
    ```js
     let data = await spotify(playlist_url)

     console.log(data.total_tracks) // This will tell no. of videos that have been fetched so far.
    ```

##### type `property`
*This will always return as "album" for this class.*

##### toJSON() `function`
*converts class into a json format*

## Validate
### sp_validate(url : `string`)
*This checks that given url is spotify url or not.*

**Returns :** `track` | `album` | `playlist` | `false`
```js
let check = sp_validate(url)

if(!check) // Invalid Spotify URL

if(check === 'track') // Spotify Track URL
```
