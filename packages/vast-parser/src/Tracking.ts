import LinearAdMetric from "./LinearAdMetric";

/**
 * Represents a TrackingEvent in VAST.
 *
 * ```ts
 * const trackingEvent = new TrackingEvent('https://example.com/tracking', LinearAdMetric.START, 10);
 * ```
 */
export default class TrackingEvent {

    /**
     * @param uri the URI of the tracking event
     * @param event the event of the tracking event
     * @param offset the offset of the tracking event
     */
    constructor(uri: string, event?: string, offset?: number) {
        this.uri = uri;
        switch (event) {
            case 'loaded':
                this.event = LinearAdMetric.LOADED;
                break;
            case 'start':
                this.event = LinearAdMetric.START;
                break;
            case 'firstQuartile':
                this.event = LinearAdMetric.FIRST_QUARTILE;
                break;
            case 'midpoint':
                this.event = LinearAdMetric.MIDPOINT;
                break;
            case 'thirdQuartile':
                this.event = LinearAdMetric.THIRD_QUARTILE;
                break;
            case 'complete':
                this.event = LinearAdMetric.COMPLETE;
                break;
            case 'otherAdInteraction':
                this.event = LinearAdMetric.OTHER_AD_INTERACTION;
                break;
            case 'progress':
                this.event = LinearAdMetric.PROGRESS;
                break;
            case 'closeLinear':
                this.event = LinearAdMetric.CLOSE_LINEAR;
                break;
            default:
                break;
        }
        this.offset = offset;
    }

    /**
     * the event of the tracking event
     */
    readonly event?: typeof LinearAdMetric[keyof typeof LinearAdMetric];

    /**
     * the URI of the tracking event
     */
    readonly uri: string;

    /**
     * the offset of the tracking event
     */
    readonly offset?: number;

}
