import { mapArrayOrElem } from '../../utils/src';
import type { XmlParserError, XmlVAST } from "./XmlVAST";
import Creative from "./Creative";
import Ad from "./Ad";
import MediaFile from "./MediaFile";
import VAST from "./VAST";
import Tracking from "./Tracking";
import Linear from "./Linear";
import InLine from "./InLine";
import Impression from "./Impression";
import Extension from "./Extension";
import CreativeExtension from "./CreativeExtension";

/**
 * Use this class to parse VAST.
 *
 * ```ts
 * const parser = new VASTParser('https://example.com/vast.xml');
 * const vast = parser.parse();
 * ```
 */
export default class VASTParser {

    /**
     * @param vast the VAST string to parse
     */
    constructor(vast: string) {
        this._originalVAST = vast;
        this._parser = new DOMParser();
        this._serializer = new XMLSerializer();
    }

    /**
     * Will parse the VAST string.
     * @returns the parsed VAST object or null if the VAST string is invalid
     */
    parse(): VAST | null {
        return this._parseVAST(this._originalVAST);
    }

    private _originalVAST: string;
    private _parser: DOMParser;
    private _serializer: XMLSerializer;

    private _parseVAST(vast: string): VAST | null {
        const vastRoot = this._parser.parseFromString(vast.trim(), 'text/xml').documentElement as XmlVAST | XmlParserError;
        if (vastRoot.tagName === 'parsererror') return null;
        const adNodes = Array.from(vastRoot.getElementsByTagName('Ad'));
        const ads = mapArrayOrElem(adNodes, ad => {
            if (!ad) return null;
            const inLineNode = ad.getElementsByTagName('InLine').item(0);
            if (!inLineNode) return null;

            const errorNodes = Array.from(inLineNode.getElementsByTagName('Error'));
            const errors = mapArrayOrElem(errorNodes, error => {
                return error.textContent ? error.textContent : null;
            });

            const extensionNodes = Array.from(inLineNode.getElementsByTagName('Extension'));
            const extensions = mapArrayOrElem(extensionNodes, extension => {
                if (extension.parentNode?.nodeName.toLowerCase() !== 'extensions') return null;

                const customXML = Array.from(extension.childNodes).map(node => {
                    return this._serializer.serializeToString(node);
                }).join('');
                return new Extension(customXML, extension.getAttribute('type') || '');
            });

            const creativeNodes = Array.from(inLineNode.getElementsByTagName('Creative'));
            const creatives = mapArrayOrElem(creativeNodes, creative => {
                if (creative.parentNode?.nodeName.toLowerCase() !== 'creatives') return null;

                const linearNode = creative.getElementsByTagName('Linear').item(0);
                if (linearNode == null) return null;

                const skipoffsetText = linearNode.getAttribute('skipoffset');
                const skipoffset = skipoffsetText ? parseInt(skipoffsetText) : undefined;

                const durationText = linearNode.getElementsByTagName('Duration').item(0)?.textContent;
                const duration = durationText ?
                    durationText.split(':')
                        .map((time, idx) => parseInt(time) * Math.pow(60, 2 - idx))
                        .reduce((prev, cur) => prev + cur, 0)
                    : 0;

                const mediaFileNodes = Array.from(linearNode.getElementsByTagName('MediaFile'));
                const mediaFiles = mapArrayOrElem(mediaFileNodes, mediaFile => {
                    if (mediaFile.parentNode?.nodeName.toLowerCase() !== 'mediafiles') return null;

                    const url = mediaFile.textContent;
                    const delivery = mediaFile.getAttribute('delivery');
                    const type = mediaFile.getAttribute('type');
                    const width = mediaFile.getAttribute('width');
                    const height = mediaFile.getAttribute('height');
                    const codec = mediaFile.getAttribute('codec');
                    const id = mediaFile.getAttribute('id');
                    const bitrate = mediaFile.getAttribute('bitrate');
                    const minBitrate = mediaFile.getAttribute('minBitrate');
                    const maxBitrate = mediaFile.getAttribute('maxBitrate');

                    if (delivery == null || !['progressive', 'streaming'].includes(delivery)) return null;
                    if (type == null || type.length === 0) return null;

                    const newMediaFile = new MediaFile(
                        url || '',
                        delivery,
                        type,
                        width ? parseInt(width) : 0,
                        height ? parseInt(height) : 0,
                        codec || undefined,
                        id || undefined,
                        bitrate ? parseInt(bitrate) : void 0,
                        minBitrate ? parseInt(minBitrate) : void 0,
                        maxBitrate ? parseInt(maxBitrate) : void 0
                    );
                    return newMediaFile;
                });

                const trackingNodes = Array.from(linearNode.getElementsByTagName('Tracking'));
                const trackingEvents = mapArrayOrElem(trackingNodes, tracking => {
                    if (tracking.parentNode?.nodeName.toLowerCase() !== 'trackingevents') return null;

                    const event = tracking.getAttribute('event');
                    const url = tracking.textContent || '';
                    return new Tracking(url, event || undefined);
                });

                const adParameters = linearNode.getElementsByTagName('AdParameters').item(0)?.textContent || '';

                const creativeExtensionNodes = Array.from(creative.getElementsByTagName('CreativeExtension'));
                const creativeExtensions = mapArrayOrElem(creativeExtensionNodes, creativeExtension => {
                    if (creativeExtension.parentNode?.nodeName.toLowerCase() !== 'creativeextensions') return null;
                    const customXML = Array.from(creativeExtension.childNodes).map(node => {
                        return this._serializer.serializeToString(node);
                    }).join('');
                    return new CreativeExtension(customXML, creativeExtension.getAttribute('type') || '');
                });

                const linear = new Linear(duration, mediaFiles, trackingEvents, adParameters, skipoffset);

                return new Creative(creative.getAttribute('id') || '', parseInt(creative.getAttribute('sequence') || '0'), linear);
            });

            const impressionNodes = Array.from(inLineNode.getElementsByTagName('Impression'));
            const impressions = mapArrayOrElem(impressionNodes, impression => {
                if (!impression.textContent) return null;
                return new Impression(impression.textContent);
            });
            const inLine = new InLine('', '', impressions, creatives, void 0, void 0, void 0, void 0, void 0, errors, extensions);

            const adId = ad.getAttribute('id');
            const adSequenceAttr = ad.getAttribute('sequence');
            const adSequence = adSequenceAttr ? parseInt(adSequenceAttr) : void 0;
            const newAd = new Ad(adId || undefined, adSequence, inLine);
            return newAd;
        });
        const version = vastRoot.getAttribute('version');

        if (version == null || version.length === 0) return null;

        const newVast = new VAST(version, ads);
        return newVast;
    }

}
