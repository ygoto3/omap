import type InLine from "./InLine";

/**
 * Represents an Ad in VAST.
 */
export default class Ad {

    /**
     * @param id the id of the ad
     * @param sequence the sequence of the ad
     * @param inLine the inLine of the ad
     */
    constructor(id?: string, sequence?: number, inLine?: InLine) {
        this.id = id;
        this.sequence = sequence;
        this.inLine = inLine;
    }

    /**
     * the id of the ad
     */
    readonly id?: string;

    /**
     * the sequence of the ad
     */
    readonly sequence?: number;

    /**
     * the inLine of the ad
     */
    readonly inLine?: InLine;

}