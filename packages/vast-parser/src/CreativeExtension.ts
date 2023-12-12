/**
 * Represents a CreativeExtension in VAST.
 */
export default class CreativeExtension {

    /**
     * @param customXML the custom XML of the creative extension
     * @param type the type of the creative extension
     */
    constructor(customXML: string, type: string) {
        this.customXML = customXML;
        this.type = type;
    }

    /**
     * the custom XML of the creative extension
     */
    readonly customXML: string;

    /**
     * the type of the creative extension
     */
    readonly type: string;

}