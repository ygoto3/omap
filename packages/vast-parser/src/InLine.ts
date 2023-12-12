import type Creative from "./Creative";
import type Extension from "./Extension";
import type Impression from "./Impression";

/**
 * Represents an InLine in VAST.
 */
export default class InLine {

    /**
     * @param adSystem the ad system of the inline
     * @param adTitle the ad title of the inline
     * @param impressions the impressions of the inline
     * @param creatives the creatives of the inline
     * @param category the category of the inline
     * @param description the description of the inline
     * @param advertiser the advertiser of the inline
     * @param pricing the pricing of the inline
     * @param survey the survey of the inline
     * @param errors the errors of the inline
     * @param extensions the extensions of the inline
     */
    constructor(adSystem: string, adTitle: string, impressions: Impression[], creatives: Creative[], category?: string, description?: string, advertiser?: string, pricing?: string, survey?: string, errors: string[] = [], extensions: Extension[] = []) {
        this.adSystem = adSystem;
        this.adTitle = adTitle;
        this.impressions = impressions;
        this.creatives = creatives;
        this.description = description;
        this.advertiser = advertiser;
        this.pricing = pricing;
        this.survey = survey;
        this.errors = errors;
        this.extensions = extensions;
    }

    /**
     * the extensions of the inline
     */
    readonly extensions: Extension[];

    /**
     * the ad system of the inline
     */
    readonly adSystem: string;

    /**
     * the ad title of the inline
     */
    readonly adTitle: string;

    /**
     * the impressions of the inline
     */
    readonly impressions: Impression[];

    /**
     * the creatives of the inline
     */
    readonly creatives: Creative[];

    /**
     * the description of the inline
     */
    readonly description?: string;

    /**
     * the advertiser of the inline
     */
    readonly advertiser?: string;

    /**
     * the pricing of the inline
     */
    readonly pricing?: string;

    /**
     * the survey of the inline
     */
    readonly survey?: string;

    /**
     * the errors of the inline
     */
    readonly errors: string[];

}