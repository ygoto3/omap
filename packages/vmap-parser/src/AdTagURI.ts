/**
 * Represents an ad tag URI.
 *
 * ```ts
 * const adTagURI = new AdTagURI('https://example.com/vmap.xml', 'vast3');
 * ```
 */
export default class AdTagURI {

    /**
     * @param uri the URI of the ad tag
     * @param templateType the template type of the ad tag
     */
    constructor(uri: string, templateType: string) {
        this.uri = uri;
        this.templateType = templateType;
    }

    /**
     * the URI of the ad tag
     */
    readonly uri: string;

    /**
     * the template type of the ad tag
     */
    readonly templateType: string;
    
}