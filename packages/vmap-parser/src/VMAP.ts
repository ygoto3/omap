import type AdBreak from "./AdBreak";

/**
 * Represents a VMAP.
 */
export default class VMAP {

    /**
     * @param adBreaks the ad breaks of the VMAP
     * @param version the version of the VMAP
     */
    constructor(adBreaks: AdBreak[], version: number) {
        this.adBreaks = adBreaks;
        this.version = version;
    }

    /**
     * the ad breaks of the VMAP
     */
    readonly adBreaks: AdBreak[];

    /**
     * the version of the VMAP
     */
    readonly version: number;

}