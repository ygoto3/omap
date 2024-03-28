import type Bitrate from "./Bitrate";

export default class AdMediaFile {

    constructor(uri: string, width: number, height: number, bitrate?: Bitrate) {
        this.uri = uri;
        this.width = width;
        this.height = height;
        this.bitrate = bitrate;
    }

    readonly uri: string;
    readonly width: number;
    readonly height: number;
    readonly bitrate?: Bitrate;

}
