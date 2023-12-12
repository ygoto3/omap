/**
 * Represents an Extension in VAST.
 */
export default class Extension {

    /**
     * @param customXML the custom XML of the extension
     * @param type the type of the extension
     */
    constructor(customXML: string, type?: string) {
        this.type = type;
        this.customXML = customXML;
    }

    /**
     * the custom XML of the extension
     */
    readonly customXML: string;

    /**
     * the type of the extension
     */
    readonly type?: string;

}