export interface Mpd {

    availabilityEndTime: number | Date | null;
    availabilityStartTime: number | Date | null;
    manifest: Manifest;
    maxSegmentDuration: number;
    mediaPresentationDuration: number;
    minimumUpdatePeriod: number;
    publishTime: Date | null;
    suggestedPresentationDelay: number;
    timeShiftBufferDepth: number;

}

export interface Manifest {

    PatchLocation: PatchLocation | PatchLocation[];
    PatchLocation_asArray: PatchLocation[];
    Period: Period | Period[];
    Period_asArray: Period[];
    baseUri: string;
    loadedTime: Date;
    mediaPresentationDuration: number;
    minBufferTime: number;
    originalUrl: string;
    profiles: string;
    protocol: string;
    type: string;
    url: string;
    'xmlns': string;
    'xmlns:xsi': string;
    'xsi:schemaLocation': string;

}

export interface Period {

    AdaptationSet: AdaptationSet | AdaptationSet[];
    AdaptationSet_asArray: AdaptationSet[];
    BaseURL: string | string[];
    BaseURL_asArray: string[];
    duration: number;
    id?: string;

}

export interface PatchLocation {

    toString: () => string;
    ttl: number;
    __children: PatchLocationChild[];
    __text: string;

}

export interface PatchLocationChild {

    '#text': string;

}

export interface AdaptationSet extends CommonAttributes {

    Representation: Representation | Representation[];
    Representation_asArray: Representation[];
    SupplementalProperty: SupplementalProperty | SupplementalProperty[];
    SupplementalProperty_asArray: SupplementalProperty[];
    contentType: string;
    frameRate: string;
    height: number;
    id: number;
    par: string;
    segmentAlignment: string;
    width: number;

}

export interface Representation {

    SegmentTemplate: SegmentTemplate;
    SegmentTemplate_asArray: SegmentTemplate[];

}

export interface SupplementalProperty {

    schemeIdUri: string;
    value: string;

}

export interface SegmentTemplate {

    SegmentTimeline: SegmentTimeline | SegmentTimeline[];
    SegmentTimeline_asArray: SegmentTimeline[];
    timescale: number;
    presentationTimeOffset: number;

}

export interface SegmentTimeline {

    S: S | S[];
    S_asArray: S[];

}

export interface S {

    d: number;
    r?: number;
    t: number;

}

interface CommonAttributes {

    mimeType?: string;

}