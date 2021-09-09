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

### Importing
```ts
import * as play from 'play-dl' // ES-6 import or TS import

const play = require('play-dl') //JS importing
```

**Instructions for Spotify** are [here](https://github.com/play-dl/play-dl/discussions/64)

### Examples
- [YouTube](https://github.com/play-dl/play-dl/tree/main/examples/YouTube)
- [Spotify](https://github.com/play-dl/play-dl/tree/main/examples/Spotify)


### Docs

- [Main](https://github.com/play-dl/play-dl/tree/main/docs#play-dl-commands)
- [YouTube](https://github.com/play-dl/play-dl/tree/main/docs/YouTube#youtube)
- [Spotify](https://github.com/play-dl/play-dl/tree/main/docs/Spotify#spotify)
