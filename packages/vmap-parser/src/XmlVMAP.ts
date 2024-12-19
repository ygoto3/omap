export interface XmlVMAP extends Element {
    tagName: 'vmap:VMAP';
    childNodes: NodeListOf<XmlVMAPAdBreak>;
}

export interface XmlParserError extends Element {
    tagName: 'parsererror';
}

interface XmlVMAPAdBreak extends Element {
    tagName: 'vmap:AdBreak';
    childNodes: NodeListOf<XmlVMAPAdSource>;
}

interface XmlVMAPAdSource extends Element {
    tagName: 'vmap:AdSource';
    childNodes: NodeListOf<XmlVMAPTrackingEvents | XmlVMAPExtensions | XmlVMAPAdData | XmlVMAPAdTagURI | XmlVMAPCustomAdData>;
}

interface XmlVMAPTrackingEvents extends Element {
    tagName: 'vmap:TrackingEvents';
    childNodes: NodeListOf<XmlVMAPTracking>;
}

interface XmlVMAPExtensions extends Element {
    tagName: 'vmap:Extensions';
}

interface XmlVMAPAdData extends Element {
    tagName: 'vmap:AdData';
}

interface XmlVMAPAdTagURI extends Element {
    tagName: 'vmap:AdTagURI';
}

interface XmlVMAPCustomAdData extends Element {
    tagName: 'vmap:CustomAdData';
}

interface XmlVMAPTracking extends Element {
    tagName: 'vmap:Tracking';
}
