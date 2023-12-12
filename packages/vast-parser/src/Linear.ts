import type MediaFile from "./MediaFile";
import type Tracking from "./Tracking";

/**
 * Represents a Linear in VAST.
 */
export default class Linear {

    /**
     * @param duration the duration of the linear
     * @param mediaFiles the media files of the linear
     * @param trackingEvents the tracking events of the linear
     * @param adParameters the ad parameters of the linear
     * @param skipOffset the skip offset of the linear
     */
    constructor(
        duration: number,
        mediaFiles: MediaFile[],
        trackingEvents?: Tracking[],
        adParameters?: string,
        skipOffset?: number
    ) {
        this.duration = duration;
        this.mediaFiles = mediaFiles;
        this.trackingEvents = trackingEvents || [];
        this.adParameters = adParameters;
        this.skipOffset = skipOffset;
    }

    readonly duration: number = 0;
    readonly mediaFiles: MediaFile[] = [];
    readonly trackingEvents: Tracking[] = [];
    readonly adParameters?: string;
    readonly skipOffset?: number;

    /**
     * Adds a tracking event.
     *
     * @param tracking the tracking to add
     */
    addTrackingEvent(tracking: Tracking): void {
        this.trackingEvents.push(tracking);
    }

}