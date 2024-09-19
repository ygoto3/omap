import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { mapArrayOrElem } from '../../utils/src';
import type { XmlVASTRoot } from "./XmlVAST";
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
        this._parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
          attributesGroupName: '_attributes',
          cdataPropName: '_cdata',
          alwaysCreateTextNode: true,
          textNodeName: '_text',
        });
        this._builder = new XMLBuilder({
          attributeNamePrefix: '',
          attributesGroupName: '_attributes',
          cdataPropName: '_cdata',
          textNodeName: '_text',
        });
    }

    /**
     * Will parse the VAST string.
     * @returns the parsed VAST object or null if the VAST string is invalid
     */
    parse(): VAST | null {
        return this._parseVAST(this._originalVAST);
    }

    private _originalVAST: string;
    private _parser: XMLParser;
    private _builder: XMLBuilder;

    private _parseVAST(vast: string): VAST | null {
        const vastRoot: XmlVASTRoot = this._parser.parse(vast) as XmlVASTRoot;
        const vastObj = vastRoot.VAST;
        const ads = mapArrayOrElem(vastObj.Ad, ad => {
            if (!ad) return null;
            const inLineNode = ad.InLine;
            if (!inLineNode) return null;

            const errorNode = inLineNode.Error;
            let errors: string[] = [];
            if (errorNode) {
                errors = mapArrayOrElem(errorNode, error => {
                    if (!error._cdata || !error._cdata._text) return null;
                    return error._cdata._text;
                });
            }

            const extensionsNode = inLineNode.Extensions;
            let extensions: Extension[] = [];
            if (extensionsNode && extensionsNode.Extension) {
                extensions = mapArrayOrElem(extensionsNode.Extension, extension => {
                    const customXML = this._builder.build(extension);
                    return new Extension(customXML, extension._attributes?.type);
                });
            }

            const creativeNode = inLineNode.Creatives?.Creative;
            if (!creativeNode) return null;
            const creatives = mapArrayOrElem(creativeNode, creative => {
                let duration = 0;
                let trackingEvents: Tracking[] = [];

                const linearNode = creative.Linear;

                const skipoffsetText = linearNode?._attributes?.skipoffset;
                const skipoffset = skipoffsetText ? parseInt(skipoffsetText) : undefined;

                const durationText = linearNode?.Duration?._text;
                if (durationText) {
                    duration = durationText.split(':')
                        .map((time, idx) => parseInt(time) * Math.pow(60, 2 - idx))
                        .reduce((prev, cur) => prev + cur, 0);
                }

                const mediaFileNode = linearNode?.MediaFiles?.MediaFile;
                if (!mediaFileNode) return null;
                const mediaFiles = mapArrayOrElem(mediaFileNode, mediaFile => {
                    const url = mediaFile._cdata._text;
                    const delivery = mediaFile._attributes.delivery;
                    const type = mediaFile._attributes.type;
                    const width = parseInt(mediaFile._attributes.width);
                    const height = parseInt(mediaFile._attributes.height);
                    const codec = mediaFile._attributes.codec;
                    const id = mediaFile._attributes.id;
                    const bitrate = mediaFile._attributes.bitrate ? parseInt(mediaFile._attributes.bitrate) : void 0;
                    const minBitrate = mediaFile._attributes.minBitrate ? parseInt(mediaFile._attributes.minBitrate) : void 0;
                    const maxBitrate = mediaFile._attributes.maxBitrate ? parseInt(mediaFile._attributes.maxBitrate) : void 0;
                    const newMediaFile = new MediaFile(
                        url,
                        delivery,
                        type,
                        width,
                        height,
                        codec,
                        id,
                        bitrate,
                        minBitrate,
                        maxBitrate,
                    );
                    return newMediaFile;
                });

                const trackingNode = linearNode?.TrackingEvents?.Tracking;
                if (trackingNode) {
                    trackingEvents = mapArrayOrElem(trackingNode, tracking => {
                        const event = tracking._attributes.event;
                        const url = tracking._cdata._text;
                        return new Tracking(url, event);
                    });
                }

                const adParameters = linearNode?.AdParameters?._cdata._text;

                const creativeExtensionsNode = creative.CreativeExtensions;
                let creativeExtensions: CreativeExtension[] = [];
                if (creativeExtensionsNode) {
                    creativeExtensions = mapArrayOrElem(creativeExtensionsNode.CreativeExtension, creativeExtension => {
                        const customXML = this._builder.build(creativeExtension);
                        return new CreativeExtension(customXML, creativeExtension._attributes?.type);
                    });
                }

                const linear = new Linear(duration, mediaFiles, trackingEvents, adParameters, skipoffset);

                return new Creative(creative._attributes.id, parseInt(creative._attributes.sequence), linear);
            });

            const impressions = mapArrayOrElem(inLineNode.Impression, impression => {
                if (!impression._cdata) return null;
                return new Impression(impression._cdata._text);
            });
            const inLine = new InLine('', '', impressions, creatives, void 0, void 0, void 0, void 0, void 0, errors, extensions);
            const newAd = new Ad(ad._attributes?.id, ad._attributes?.sequence ? parseInt(ad._attributes.sequence) : void 0, inLine);
            return newAd;
        });
        const newVast = new VAST(vastObj._attributes.version, ads);
        return newVast;
    }

}
