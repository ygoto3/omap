import type { AdBreak as ParserAdBreak } from "@ygoto3/omap-vmap-parser";
import type Ad from "./Ad";
import type AdBreak from "./AdBreak";
import type AdCreative from "./AdCreative";
import type AdPodInsertionRequest from "./AdPodInsertionRequest";
import type OmapClientEvent from "./ClientEvent";

/** Interface for OMAP client implementations */
export default interface IOmapClient {

    /**
     * Will start playing ads.
     * After calling this method, the client will start to request ads.
     */
    play(): void;

    /**
     * Use the method to notify the client the current time in seconds.
     * @param currentTime current time in seconds
     */
    notifyCurrentTime(currentTime: number): void;

    /**
     * Use the method to notify the client that the current ad pod has ended.
     */
    notifyAdPodEnded(): void;

    /**
     * Use the method to notify the client that the current ad pod has been skipped.
     */
    notifyAdPodSkipped(): void;

    /**
     * Use the method to notify the client that the current ad has started.
     * @param ad the ad that has started
     */
    notifyAdStarted(ad: Ad): void;

    /**
     * Use the method to notify the client the playing ad creative's playhead information.
     * @param adCreative the ad creative that is playing
     * @param elapsedTime the elapsed time in the ad creative
     * @param adSequence the ad sequence number in the ad pod
     */
    notifyAdCreativePlaying(adCreative: AdCreative, elapsedTime: number, adSequence: number): void;
    
    /**
     * Use the method to notify the client that the playing ad has ended.
     * @param adCreative the ad creative that has ended
     * @param adSequence the ad sequence number in the ad pod
     */
    notifyAdCreativeEnded(adCreative: AdCreative, adSequence: number): void;

    /**
     * Use the method to notify the client that an error has occured while playing the ad creative.
     * @param adCreative the ad creative that has ended
     * @param adSequence the ad sequence number in the ad pod
     */
    notifyAdPlaybackError(ad: Ad): void;

    /**
     * Use the method to check if the client has ad pod insertion point at the time.
     */
    hasAdPodInsertionAt(time: number): boolean;

    /**
     * Will replace ad insertion decider.
     * @param filter the custom ad decider function
     */
    attachAdInsertionDecider(
        filter: (
            currentTime: number,
            adBreaks: ParserAdBreak[],
            countAdBreakConsumption: (adBreak: ParserAdBreak) => number,
        ) => ParserAdBreak | undefined
    ): void;

    /**
     * Use the on method to listen for the `CONTENT_CAN_PLAY` event.
     * @param type the type of event : `CONTENT_CAN_PLAY`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.CONTENT_CAN_PLAY, listener: () => void): void;

    /**
     * Use the on method to listen for the `CONTENT_PAUSE_REQUESTED` event.
     * @param type the type of event : `CONTENT_PAUSE_REQUESTED`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.CONTENT_PAUSE_REQUESTED, listener: () => void): void;

    /**
     * Use the on method to listen for the `CONTENT_RESUME_REQUESTED` event.
     * @param type the type of event : `CONTENT_RESUME_REQUESTED`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.CONTENT_RESUME_REQUESTED, listener: () => void): void;

    /**
     * Use the on method to listen for the `ALL_ADS_COMPLETED` event.
     * @param type the type of event : `OmapClientEvent.ALL_ADS_COMPLETED`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.ALL_ADS_COMPLETED, listener: () => void): void;

    /**
     * Use the on method to listen for the `LOADED` event.
     * @param type the type of event : `OmapClientEvent.LOADED`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.LOADED, listener: (adBreaks: AdBreak[]) => void): void;

    /**
     * Use the on method to listen for the `LOAD_ERROR` event.
     * @param type the type of event : `OmapClientEvent.LOAD_ERROR`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.LOAD_ERROR, listener: () => void): void;

    /**
     * Use the on method to listen for the `STARTED` event.
     * @param type the type of event : `OmapClientEvent.STARTED`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.STARTED, listener: () => void): void;

    /**
     * Use the on method to listen for the `COMPLETE` event.
     * @param type the type of event : `OmapClientEvent.COMPLETE`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.COMPLETE, listener: () => void): void;

    /**
     * Use the on method to listen for the `AD_POD_INSERTION_REQUESTED` event.
     * @param type the type of event : `OmapClientEvent.AD_POD_INSERTION_REQUESTED`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUESTED, listener: (adPodInsertionRequest: AdPodInsertionRequest) => void): void;

    /**
     * Use the on method to listen for the `AD_POD_INSERTION_REQUEST_FAILED` event.
     * @param type the type of event : `OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED, listener: () => void): void;

    /**
     * Use the on method to listen for the `AD_POD_PREPARATION_REQUESTED` event.
     * @param type the type of event : `OmapClientEvent.AD_POD_PREPARATION_REQUESTED`
     * @param listener the listener function
     */
    on(type: typeof OmapClientEvent.AD_POD_PREPARATION_REQUESTED, listener: (adPodInsertionRequest: AdPodInsertionRequest) => void): void;

    /**
     * Use the off method to remove listener for the `CONTENT_CAN_PLAY` event.
     * @param type the type of event : `OmapClientEvent.CONTENT_CAN_PLAY`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.CONTENT_CAN_PLAY, listener: () => void): void;

    /**
     * Use the off method to remove listener for the `CONTENT_PAUSE_REQUESTED` event.
     * @param type the type of event : `OmapClientEvent.CONTENT_PAUSE_REQUESTED`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.CONTENT_PAUSE_REQUESTED, listener: () => void): void;

    /**
     * Use the off method to remove listener for the `CONTENT_RESUME_REQUESTED` event.
     * @param type the type of event : `OmapClientEvent.CONTENT_RESUME_REQUESTED`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.CONTENT_RESUME_REQUESTED, listener: () => void): void;

    /**
     * Use the off method to remove listener for the `ALL_ADS_COMPLETED` event.
     * @param type the type of event : `OmapClientEvent.ALL_ADS_COMPLETED`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.ALL_ADS_COMPLETED, listener: () => void): void;

    /**
     * Use the off method to remove listener for the `LOADED` event.
     * @param type the type of event : `OmapClientEvent.LOADED`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.LOADED, listener: (adBreaks: AdBreak[]) => void): void;

    /**
     * Use the off method to remove listener for the `LOAD_ERROR` event.
     * @param type the type of event : `OmapClientEvent.LOAD_ERROR`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.LOAD_ERROR, listener: () => void): void;

    /**
     * Use the off method to remove listener for the `STARTED` event.
     * @param type the type of event : `OmapClientEvent.STARTED`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.STARTED, listener: () => void): void;

    /**
     * Use the off method to remove listener for the `COMPLETE` event.
     * @param type the type of event : `OmapClientEvent.COMPLETE`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.COMPLETE, listener: () => void): void;

    /**
     * Use the off method to remove listener for the `AD_POD_INSERTION_REQUESTED` event.
     * @param type the type of event : `OmapClientEvent.AD_POD_INSERTION_REQUESTED`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUESTED, listener: (adPodInsertionRequest: AdPodInsertionRequest) => void): void;

    /**
     * Use the off method to remove listener for the `AD_POD_INSERTION_REQUEST_FAILED` event.
     * @param type the type of event : `OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED, listener: () => void): void;

    /**
     * Use the off method to remove listener for the `AD_POD_PREPARATION_REQUESTED` event.
     * @param type the type of event : `OmapClientEvent.AD_POD_PREPARATION_REQUESTED`
     * @param listener the listener function
     */
    off(type: typeof OmapClientEvent.AD_POD_PREPARATION_REQUESTED, listener: (adPodInsertionRequest: AdPodInsertionRequest) => void): void;

}
