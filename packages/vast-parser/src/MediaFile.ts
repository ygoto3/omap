/**
 * Represents a MediaFile in VAST.
 */
export default class MediaFile {

    /**
     * @param url the url of the media file
     * @param delivery the delivery of the media file
     * @param type the type of the media file
     * @param width the width of the media file
     * @param height the height of the media file
     */
    constructor(url: string, delivery: string, type: string, width: number, height: number) {
        this.url = url;
        this.delivery = delivery;
        this.type = type;
        this.width = width;
        this.height = height;
    }

    readonly url: string;
    readonly delivery: string;
    readonly type: string;
    readonly width: number;
    readonly height: number;

}