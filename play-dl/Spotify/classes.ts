

interface SpotifyTrackAlbum{
    name : string;
    url : string;
    id : string;
    release_date : string;
    release_date_precision : string;
    total_tracks : number;
}

interface SpotifyArtists{
    name : string;
    url : string;
    id : string;
}

interface SpotifyThumbnail{
    height : number;
    width : number
    url : string
}

interface SpotifyCopyright{
    text : string;
    type : string;
}

export class SpotifyVideo{
    name : string;
    type : "video" | "playlist" | "album"
    id : string;
    url : string;
    explicit : boolean;
    durationInSec : number;
    durationInMs : number;
    artists : SpotifyArtists[]
    album : SpotifyTrackAlbum
    thumbnail : SpotifyThumbnail
    constructor(data : any){
        this.name = data.name
        this.id = data.id
        this.type = "video"
        this.url = data.external_urls.spotify
        this.explicit = data.explicit
        this.durationInMs = data.duration_ms
        this.durationInSec = Math.round(this.durationInMs/1000)
        let artists : SpotifyArtists[] = []
        data.artists.forEach((v : any) => {
            artists.push({
                name : v.name,
                id : v.id,
                url : v.external_urls.spotify
            })
        })
        this.artists = artists
        this.album = {
            name : data.album.name,
            url : data.external_urls.spotify,
            id : data.album.id,
            release_date : data.album.release_date,
            release_date_precision : data.album.release_date_precision,
            total_tracks : data.album.total_tracks
        }
        this.thumbnail = data.album.images[0]
    }

    toJSON(){
        return {
            name : this.name,
            id : this.id,
            type : this.type,
            url : this.url,
            explicit : this.explicit,
            durationInMs : this.durationInMs,
            durationInSec : this.durationInSec,
            artists : this.artists,
            album : this.album,
            thumbnail : this.thumbnail
        }
    }
}

export class SpotifyPlaylist{
    name : string;
    type : "video" | "playlist" | "album"
    collaborative : boolean;
    description : string;
    url : string;
    id : string;
    thumbnail : SpotifyThumbnail;
    owner : SpotifyArtists;
    tracks : SpotifyVideo[]
    constructor(data : any){
        this.name = data.name
        this.type = "playlist"
        this.collaborative = data.collaborative
        this.description = data.description
        this.url = data.external_urls.spotify
        this.id = data.id
        this.thumbnail = data.images[0]
        this.owner = {
            name : data.owner.display_name,
            url : data.owner.external_urls.spotify,
            id : data.owner.id
        }
        let videos: SpotifyVideo[] = []
        data.tracks.items.forEach((v : any) => {
            videos.push(new SpotifyVideo(v.track))
        })
        this.tracks = videos
    }

    toJSON(){
        return {
            name : this.name,
            type : this.type,
            collaborative : this.collaborative,
            description : this.description,
            url : this.url,
            id : this.id,
            thumbnail : this.thumbnail,
            owner : this.owner,
            tracks : this.tracks
        }
    }
}

export class SpotifyAlbum{
    name : string
    type : "video" | "playlist" | "album"
    url : string
    thumbnail : SpotifyThumbnail
    artists : SpotifyArtists[]
    copyrights : SpotifyCopyright[]
    release_date : string;
    release_date_precision : string;
    total_tracks : number
    tracks : SpotifyTracks[]
    constructor(data : any){
        this.name = data.name
        this.type = "album"
        this.url = data.external_urls.spotify
        this.thumbnail = data.images[0]
        let artists : SpotifyArtists[] = []
        data.artists.forEach((v : any) => {
            artists.push({
                name : v.name,
                id : v.id,
                url : v.external_urls.spotify
            })
        })
        this.artists = artists
        this.copyrights = data.copyrights
        this.release_date = data.release_date
        this.release_date_precision = data.release_date_precision
        this.total_tracks = data.total_tracks
        let videos: SpotifyTracks[] = []
        data.tracks.items.forEach((v : any) => {
            videos.push(new SpotifyTracks(v))
        })
        this.tracks = videos
    }

    toJSON(){
        return {
            name : this.name,
            type : this.type,
            url : this.url,
            thumbnail : this.thumbnail,
            artists : this.artists,
            copyrights : this.copyrights,
            release_date : this.release_date,
            release_date_precision : this.release_date_precision,
            total_tracks : this.total_tracks,
            tracks : this.tracks
        }
    }
}

class SpotifyTracks{
    name : string;
    type : "video" | "playlist" | "album"
    id : string;
    url : string;
    explicit : boolean;
    durationInSec : number;
    durationInMs : number;
    artists : SpotifyArtists[]
    constructor(data : any){
        this.name = data.name
        this.id = data.id
        this.type = "video"
        this.url = data.external_urls.spotify
        this.explicit = data.explicit
        this.durationInMs = data.duration_ms
        this.durationInSec = Math.round(this.durationInMs/1000)
        let artists : SpotifyArtists[] = []
        data.artists.forEach((v : any) => {
            artists.push({
                name : v.name,
                id : v.id,
                url : v.external_urls.spotify
            })
        })
        this.artists = artists
    }

    toJSON(){
        return {
            name : this.name,
            id : this.id,
            type : this.type,
            url : this.url,
            explicit : this.explicit,
            durationInMs : this.durationInMs,
            durationInSec : this.durationInSec,
            artists : this.artists,
        }
    }
}