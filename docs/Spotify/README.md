# Spotify

## Validate
### sp_validate(url : `string`)
*This checks that given url is spotify url or not.*

**Returns :** `track` | `album` | `playlist` | `false`
```js
let check = sp_validate(url)

if(!check) // Invalid Spotify URL

if(check === 'track') // Spotify Track URL
```

## Main
### spotify(url : `string`)
*This returns data from a track | playlist | album url.*

```js
let data = spotify(url) //Gets the data

console.log(data.type) // Console logs the type of data that you got.
```