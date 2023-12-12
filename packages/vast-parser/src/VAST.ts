import type Ad from "./Ad";

/**
 * Represents a VAST.
 * 
 * ```ts
 * const vast = new VAST('4.1', [ad]);
 * ```
 */
export default class VAST {

    /**
     * @param version the version of the VAST
     * @param ads the ads of the VAST
     */
    constructor(version: string, ads: Ad[]) {
        this.version = version;
        this.ads = ads;
    }

    /**
     * the version of the VAST
     */
    readonly version: string;

    /**
     * the ads of the VAST
     */
    readonly ads: Ad[];

}