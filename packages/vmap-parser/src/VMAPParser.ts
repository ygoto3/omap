import { XMLParser } from 'fast-xml-parser';
import VMAP from "./VMAP";
import type { XmlVMAPRoot } from './XmlVMAP';
import AdTagURI from './AdTagURI';
import AdSource from './AdSource';
import AdBreak from './AdBreak';
import { mapArrayOrElem } from '../../utils/src';

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
        this._parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
          attributesGroupName: '_attributes',
          cdataPropName: '_cdata',
          alwaysCreateTextNode: true,
          textNodeName: '_text',
        });
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
    private _parser: XMLParser;

    private _parseVMAP(vmap: string): VMAP | null {
        const vmapRoot: XmlVMAPRoot = this._parser.parse(vmap) as XmlVMAPRoot;
        const vmapObj = vmapRoot['vmap:VMAP'];
        const adBreaks = mapArrayOrElem(vmapObj['vmap:AdBreak'], adBreak => {
            if (!adBreak) return null;
            const adSources = mapArrayOrElem(adBreak['vmap:AdSource'], adSource => {
                const cdata = adSource['vmap:AdTagURI']?._cdata._text;
                const templateType = adSource['vmap:AdTagURI']?._attributes.templateType;
                if (cdata && templateType) {
                    console.log(cdata);
                    const adTagUri = new AdTagURI(cdata, templateType);
                    const newAdSource = new AdSource(adTagUri);
                    return newAdSource;
                }
                return null;
            });

            const newAdBreak = new AdBreak(
                adBreak._attributes.timeOffset,
                adBreak._attributes.breakType,
                adSources,
                adBreak._attributes.breakId,
                adBreak._attributes.repeatAfter,
            );
            return newAdBreak;
        });
        const newVMAP = new VMAP(adBreaks, +vmapObj._attributes.version);
        return newVMAP;
    }

}
