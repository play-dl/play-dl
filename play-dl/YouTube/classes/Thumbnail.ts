export class YouTubeThumbnail {
    id : string;
    url : string;
    width : number;
    height : number;

    constructor(data : any){
        this.id = data.id
        this.url = data.url
        this.width = data.width
        this.height = data.height
    }

    toJSON(){
        return {
            id : this.id,
            url : this.url,
            width : this.width,
            height : this.height
        }
    }
}