import type AdTagURI from "./AdTagURI";

/**
 * Represents an AdSource in VMAP.
 */
export default class AdSource {

    /**
     * @param adTagURI the ad tag URI of the ad source
     */
    constructor(adTagURI: AdTagURI) {
        this.adTagURI = adTagURI;
    }

    /**
     * the ad tag URI of the ad source
     */
    readonly adTagURI: AdTagURI;

}