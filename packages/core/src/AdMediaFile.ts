export default class AdMediaFile {

    constructor(uri: string, width: number, height: number) {
        this.uri = uri;
        this.width = width;
        this.height = height;
    }

    readonly uri: string;
    readonly width: number;
    readonly height: number;

}