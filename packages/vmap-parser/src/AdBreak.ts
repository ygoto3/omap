import type AdSource from "./AdSource";

/**
 * Represents an AdBreak in VMAP.
 */
export default class AdBreak {

    /**
     * @param timeOffset the time offset of the ad break
     * @param breakType the break type of the ad break
     * @param adSources the ad sources of the ad break
     * @param breakId the break id of the ad break
     * @param repeatAfter the repeat after of the ad break
     */
    constructor(
        timeOffset: string,
        breakType: string,
        adSources: AdSource[],
        breakId?: string,
        repeatAfter?: string,
    ) {
        this.timeOffset = timeOffset;
        this.breakType = breakType;
        this.adSources = adSources;
        this.breakId = breakId;
        this.repeatAfter = repeatAfter;
    }

    /**
     * the time offset of the ad break
     */
    readonly timeOffset: string;

    /**
     * the break type of the ad break
     */
    readonly breakType: string;

    /**
     * the ad sources of the ad break
     */
    readonly adSources: AdSource[] = [];

    /**
     * the break id of the ad break
     */
    readonly breakId?: string;

    /**
     * the repeat after of the ad break
     */
    readonly repeatAfter?: string;

    /**
     * Add an AdSource to the ad break.
     * @param adSource the AdSource to add
     */
    addAdSource(adSource: AdSource): void {
        this.adSources.push(adSource);
    }

}