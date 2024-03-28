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
    constructor(
        url: string,
        delivery: string,
        type: string,
        width: number,
        height: number,
        codec?: string,
        id?: string,
        bitrate?: number,
        minBitrate?: number,
        maxBitrate?: number,
    ) {
        this.url = url;
        this.delivery = delivery;
        this.type = type;
        this.width = width;
        this.height = height;

        this.codec = codec;
        this.id = id;
        this.bitrate = bitrate;
        this.minBitrate = minBitrate;
        this.maxBitrate = maxBitrate;
    }

    readonly url: string;
    readonly delivery: string;
    readonly type: string;
    readonly width: number;
    readonly height: number;
    readonly codec?: string;
    readonly id?: string;
    readonly bitrate?: number;
    readonly minBitrate?: number;
    readonly maxBitrate?: number;

}
