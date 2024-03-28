import type Ad from "./Ad";
import type BinderConfig from "./BinderConfig";
import type BinderEvent from "./BinderEvent";
import type IClient from "./IClient";
import type TBinderState from "./TBinderState";

/** Interface for OMAP binder implementations */
export default interface IOmapBinder {

    /** The binder's state */
    readonly state: TBinderState;

    /**
     * The tricky media player handler can be provided where some interaction with the media player needs to be done in a tricky way.
     * In that case, use the tricky media player handler's methods instead of those of the media player itself.
     */
    readonly trickyMediaPlayerHandler?: Object;

    /**
     * Will destroy the OMAP binder.
     */
    destroy(): void;
    
    /**
     * Will bind an OMAP client to the media player that the binder uses.
     * @param omapClient the OMAP client to bind
     */
    bind(omapClient: IClient): void;

    /**
     * Will start playing the OMAP client.
     * @param startTime the start time in seconds.
     */
    play(startTime?: number): Promise<void>;

    /**
     * Will skip the current ad break.
     */
    skip(): void;

    /**
     * Will update the configuration of the binder.
     */
    updateConfig(config: Partial<BinderConfig>): void;

    /**
     * Use the on method to listen for the `AD_POD_STARTED` event.
     * @param type the type of event : `BinderEvent.AD_POD_STARTED`
     * @param listener the listener function
     */
    on(
        type: typeof BinderEvent.AD_POD_STARTED,
        listener: () => void
    ): void;

    /**
     * Use the on method to listen for the `AD_POD_ENDED` event.
     * @param type the type of event : `BinderEvent.AD_POD_ENDED`
     * @param listener the listener function
     */
    on(
        type: typeof BinderEvent.AD_POD_ENDED,
        listener: () => void
    ): void;

    /**
     * Use the on method to listen for the `AD_STARTED` event.
     * @param type the type of event : `BinderEvent.AD_STARTED`
     * @param listener the listener function
     */
    on(
        type: typeof BinderEvent.AD_STARTED,
        listener: (ad: Ad) => void
    ): void;

    /**
     * Use the on method to listen for the `AD_ENDED` event.
     * @param type the type of event : `BinderEvent.AD_ENDED`
     * @param listener the listener function
     */
    on(
        type: typeof BinderEvent.AD_ENDED,
        listener: (ad: Ad) => void
    ): void;

    /**
     * Use the on method to listen for the `AD_INFO_UPDATED` event.
     * @param type the type of event : `BinderEvent.AD_INFO_UPDATED`
     * @param listener the listener function
     */
    on(
        type: typeof BinderEvent.AD_INFO_UPDATED,
        listener: (sequence: number, numOfAds: number, remainingTime: number, duration: number) => void
    ): void;

    /**
     * Use the on method to listen for the `AD_SKIPPABLE_STATE_CHANGED` event.
     * @param type the type of event : `BinderEvent.AD_SKIPPABLE_STATE_CHANGED`
     * @param listener the listener function
     */
    on(
        type: typeof BinderEvent.AD_SKIPPABLE_STATE_CHANGED,
        listener: (skippable: boolean) => void
    ): void;

    /**
     * Use the on method to remove listeners for the `AD_POD_STARTED` event.
     * @param type the type of event : `BinderEvent.AD_POD_STARTED`
     * @param listener the listener function
     */
    off(
        type: typeof BinderEvent.AD_POD_STARTED,
        listener: () => void
    ): void;

    /**
     * Use the on method to remove listeners for the `AD_POD_ENDED` event.
     * @param type the type of event : `BinderEvent.AD_POD_ENDED`
     * @param listener the listener function
     */
    off(
        type: typeof BinderEvent.AD_POD_ENDED,
        listener: () => void
    ): void;

    /**
     * Use the on method to remove listeners for the `AD_STARTED` event.
     * @param type the type of event : `BinderEvent.AD_STARTED`
     * @param listener the listener function
     */
    off(
        type: typeof BinderEvent.AD_STARTED,
        listener: (ad: Ad) => void
    ): void;

    /**
     * Use the on method to remove listeners for the `AD_ENDED` event.
     * @param type the type of event : `BinderEvent.AD_ENDED`
     * @param listener the listener function
     */
    off(
        type: typeof BinderEvent.AD_ENDED,
        listener: (ad: Ad) => void
    ): void;

    /**
     * Use the on method to remove listeners for the `AD_INFO_UPDATED` event.
     * @param type the type of event : `BinderEvent.AD_INFO_UPDATED`
     * @param listener the listener function
     */
    off(
        type: typeof BinderEvent.AD_INFO_UPDATED,
        listener: (sequence: number, numOfAds: number, remainingTime: number, duration: number) => void
    ): void;

    /**
     * Use the on method to remove listeners for the `AD_SKIPPABLE_STATE_CHANGED` event.
     * @param type the type of event : `BinderEvent.AD_SKIPPABLE_STATE_CHANGED`
     * @param listener the listener function
     */
    off(
        type: typeof BinderEvent.AD_SKIPPABLE_STATE_CHANGED,
        listener: () => void
    ): void;
    
}
