import VMAP from "./VMAP";
import type { XmlParserError, XmlVMAP } from './XmlVMAP';
import AdTagURI from './AdTagURI';
import AdSource from './AdSource';
import AdBreak from './AdBreak';
import { mapArrayOrElem } from '../../utils/src';

const NAMESPACE = 'http://www.iab.net/videosuite/vmap';

/**
 * Use this class to parse VMAP.
 *
 * ```ts
 * const parser = new VMAPParser('https://example.com/vmap.xml');
 * const vmap = parser.parse();
 * ```
 */
export default class VMAPParser {

    /**
     * @param vmap the VMAP string to parse
     */
    constructor(vmap: string) {
        this._originalVMAP = vmap;
        this._parser = new DOMParser();
    }

    /**
     * Will parse the VMAP string.
     * @returns the parsed VMAP object or null if the VMAP string is invalid
     */
    parse(): VMAP | null {
        if (!this._originalVMAP) return null;
        return this._parseVMAP(this._originalVMAP);
    }

    private _originalVMAP: string | undefined;
    private _parser: DOMParser;

    private _parseVMAP(vmap: string): VMAP | null {
        const vmapRoot = this._parser.parseFromString(vmap.trim(), 'text/xml').documentElement as XmlVMAP | XmlParserError;
        if (vmapRoot.tagName === 'parsererror') return null;
        const adBreakNodes = Array.from(vmapRoot.getElementsByTagNameNS(NAMESPACE, 'AdBreak'));
        const adBreaks = mapArrayOrElem(adBreakNodes, adBreak => {
            if (!adBreak) return null;
            const adSourceNodes = Array.from(adBreak.getElementsByTagNameNS(NAMESPACE, 'AdSource'));
            const adSources = mapArrayOrElem(adSourceNodes, adSource => {
                const adTagURI = adSource.getElementsByTagNameNS(NAMESPACE, 'AdTagURI').item(0);
                const cdata = adTagURI?.textContent;
                const templateType = adTagURI?.getAttribute('templateType');
                if (cdata && templateType) {
                    console.log(cdata);
                    const adTagUri = new AdTagURI(cdata, templateType);
                    const newAdSource = new AdSource(adTagUri);
                    return newAdSource;
                }
                return null;
            });
            const timeOffset = adBreak.getAttribute('timeOffset');
            const breakType = adBreak.getAttribute('breakType');
            const breakId = adBreak.getAttribute('breakId');
            const repeatAfter = adBreak.getAttribute('repeatAfter') || '';

            if (timeOffset == null || timeOffset.length === 0) return null;
            if (breakType == null || breakType.length === 0) return null;

            const newAdBreak = new AdBreak(
                timeOffset,
                breakType,
                adSources,
                breakId || undefined,
                repeatAfter,
            );
            return newAdBreak;
        });
        const newVMAP = new VMAP(adBreaks, Number(vmapRoot.getAttribute('version')));
        return newVMAP;
    }

}
