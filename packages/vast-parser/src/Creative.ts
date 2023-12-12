import type Linear from "./Linear";

/**
 * Represents a Creative in VAST.
 */
export default class Creative {

    /**
     * @param id the id of the creative
     * @param sequence the sequence of the creative
     * @param linear the linear of the creative
     */
    constructor(id: string, sequence: number, linear: Linear) {
        this.id = id;
        this.sequence = sequence;
        this.linear = linear;
    }

    /**
     * the id of the creative
     */
    readonly id: string;

    /**
     * the sequence of the creative
     */
    readonly sequence: number;

    /**
     * the linear of the creative
     */
    readonly linear: Linear | undefined;

}