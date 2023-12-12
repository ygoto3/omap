/**
 * Represents an Impression in VAST.
 */
export default class Impression {

    /**
     * @param url the url of the impression
     * @param id the id of the impression
     */
    constructor(url: string, id?: string) {
        this.id = id;
        this.url = url;
    }

    /**
     * the id of the impression
     */
    readonly id?: string;

    /**
     * the url of the impression
     */
    readonly url: string;

}