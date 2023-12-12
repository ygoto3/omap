export interface XmlVMAPRoot {
    ['vmap:VMAP']: XmlVMAP;
}

interface XmlVMAP {
    _attributes: XmlVMAPAttributes;
    ['vmap:AdBreak']?: XmlVMAPAdBreak | XmlVMAPAdBreak[];
}

interface XmlVMAPAttributes {
    version: string;
    ['xmlns:vmap']: string;
}

interface XmlVMAPAdBreak {
    _attributes: XmlVMAPAdBreakAttributes;
    ['vmap:AdSource']: XmlVMAPAdSource | XmlVMAPAdSource[];
}

interface XmlVMAPAdBreakAttributes {
    timeOffset: string;
    breakType: string;
    breakId?: string;
    repeatAfter?: string;
}

interface XmlVMAPAdSource {
    _attributes: XmlVMAPAdSourceAttributes;
    ['vmap:TrackingEvents']?: XmlVMAPTrackingEvents;
    ['vmap:Extensions']?: XmlVMAPExtensions;
    ['vmap:AdData']?: XmlVMAPAdData;
    ['vmap:AdTagURI']?: XmlVMAPAdTagURI;
    ['vmap:CustomAdData']?: XmlVMAPCustomAdData;
}

interface XmlVMAPAdSourceAttributes {
    id: string;
    allowMultipleAds: string;
    followRedirects: string;
}

interface XmlVMAPTrackingEvents {
    ['vmap:Tracking']: XmlVMAPTracking | XmlVMAPTracking[];
}

interface XmlVMAPExtensions {
}

interface XmlVMAPAdData {
}

interface XmlVMAPAdTagURI {
    _attributes: XmlVMAPAdTagURIAtributes;
    _cdata: string;
}

interface XmlVMAPAdTagURIAtributes {
    templateType: 'vast' | 'vast1' | 'vast2' | 'vast3';
}

interface XmlVMAPCustomAdData {
}

interface XmlVMAPTracking {
    _attributes: XmlVMAPTrackingAttributes;
}

interface XmlVMAPTrackingAttributes {
    event: string;
}