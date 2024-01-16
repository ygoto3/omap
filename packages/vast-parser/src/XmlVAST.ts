import type convert from "xml-js";

export interface XmlVASTRoot extends convert.ElementCompact {
    VAST: XmlVAST;
}

// 3.2 VAST
interface XmlVAST {
    _attributes: XmlVASTAttributes;
    Ad?: XmlVASTAd | XmlVASTAd[];
    Error?: XmlVASTError;
}

interface XmlVASTAttributes {
    version: string;
}

// 3.2.1 Error (VAST)
interface XmlVASTError {
    _cdata: string;
}

// 3.3 Ad
interface XmlVASTAd {
    _attributes?: XmlVASTAdAttributes;
    InLine?: XmlVASTInLine;
    Wrapper?: XmlVASTWrapper;
}

interface XmlVASTAdAttributes {
    id?: string;
    sequence?: string;
}

// 3.4 InLine
interface XmlVASTInLine {
    AdSystem: XmlVASTAdSystem;
    AdTitle: XmlVASTAdTitle;
    AdServingId: XmlVASTAdServingId;
    Impression: XmlVASTImpression | XmlVASTImpression[];
    Category?: XmlVASTCategory | XmlVASTCategory[];
    Description?: XmlVASTDescription;
    Advertiser?: XmlVASTAdvertiser;
    Pricing?: XmlVASTPricing;
    Survey?: XmlVASTSurvey | XmlVASTSurvey[];
    Expires?: XmlVASTExpires;
    Error?: XmlVASTError | XmlVASTError[];
    ViewableImpression?: XmlVASTViewableImpression;
    Creatives: XmlVASTCreativesInInLine;
    Extensions: XmlVASTExtensions;
}

// 3.4.1 AdSystem
interface XmlVASTAdSystem {
    _text: string;
}

// 3.4.2 AdTitle
interface XmlVASTAdTitle {
    _text: string;
}

// 3.4.3 AdServingId
interface XmlVASTAdServingId {
    _text: string;
}

// 3.4.4 Impression
interface XmlVASTImpression {
    _cdata: string;
}

// 3.4.5 Category
interface XmlVASTCategory {
    _attributes: XmlVASTCategoryAttributes;
    _text: string;
}

interface XmlVASTCategoryAttributes {
    authority: string;
}

// 3.4.6 Description
interface XmlVASTDescription {
    _cdata: string;
}

// 3.4.7 Advertiser
interface XmlVASTAdvertiser {
    _attributes: XmlVASTAdvertiserAttributes;
    _text: string;
}

interface XmlVASTAdvertiserAttributes {
    _text: string;
}

// 3.4.8 Pricing
interface XmlVASTPricing {
    _attributes: XmlVASTPricingAttributes;
    _text: string;
}

interface XmlVASTPricingAttributes {
    model: 'CPM' | 'CPC' | 'CPE' | 'CPV';
    currency: string;
}

// 3.4.9 Survey
interface XmlVASTSurvey {
    _attributes: XmlVASTSurveyAttributes;
    _text: string;
}

interface XmlVASTSurveyAttributes {
    type: string;
}

// 3.4.10 Expires
interface XmlVASTExpires {
    _text: string;
}

// 3.4.11 Error
interface XmlVASTError {
    _cdata: string;
}

// 3.5 ViewableImpression
interface XmlVASTViewableImpression {
    _attributes: XmlVASTViewableImpressionAttributes;
    Viewable?: XmlVASTViewable | XmlVASTViewable[];
    NotViewable?: XmlVASTNotViewable | XmlVASTNotViewable[];
    ViewUndetermined?: XmlVASTViewUndetermined | XmlVASTViewUndetermined[];
}

interface XmlVASTViewableImpressionAttributes {
    id: string;
}

// 3.5.1 Viewable
interface XmlVASTViewable {
    _cdata: string;
}

// 3.5.2 NotViewable
interface XmlVASTNotViewable {
    _cdata: string;
}

// 3.5.3 ViewUndetermined
interface XmlVASTViewUndetermined {
    _cdata: string;
}

// 3.6 Creatives
interface XmlVASTCreatives {
    Creative: XmlVASTCreative | XmlVASTCreative[];
}

interface XmlVASTCreativesInInLine extends XmlVASTCreatives {
    Creative: XmlVASTCreativeInInLine | XmlVASTCreativeInInLine[];
}

// 3.7 Creative
interface XmlVASTCreative {
    _attributes: XmlVASTCreativeAttributes;
    Linear?: XmlVASTLinear;
    NonLinearAds?: XmlVASTNonLinearAds;
}

interface XmlVASTCreativeAttributes {
    id: string;
    adId: string;
    sequence: string;
    apiFramework: string;
}

interface XmlVASTCreativeInInLine extends XmlVASTCreative {
    UniversalAdId: XmlVASTUniversalAdId | XmlVASTUniversalAdId[];
    CreativeExtensions?: XmlVASTCreativeExtensions;
    Linear?: XmlVASTLinearInInLine;
}

// 3.7.1 UniversalAdId
interface XmlVASTUniversalAdId {
    _attributes: XmlVASTUniversalAdIdAttributes;
    _text: string;
}

interface XmlVASTUniversalAdIdAttributes {
    idRegistry: string;
}

// 3.7.2 CreativeExtensions
interface XmlVASTCreativeExtensions {
    CreativeExtension: XmlVASTCreativeExtension | XmlVASTCreativeExtension[];
}

// 3.7.3 CreativeExtension
interface XmlVASTCreativeExtension {
    _attributes: XmlVASTCreativeExtensionAttributes;
    [key: string]: convert.ElementCompact | undefined;
}

interface XmlVASTCreativeExtensionAttributes extends convert.Attributes {
    type: string;
}

// 3.8 Linear
interface XmlVASTLinear {
    _attributes?: XmlVASTLinearAttributes;
    TrackingEvents: XmlVASTTrackingEvents;
    VideoClicks?: XmlVASTVideoClicks;
    Icons?: XmlVASTIcons;
}

interface XmlVASTLinearAttributes {
    skipoffset: string;
}

interface XmlVASTLinearInInLine extends XmlVASTLinear {
    Duration: XmlVASTDuration;
    AdParameters?: XmlVASTAdParameters;
    MediaFiles: XmlVASTMediaFiles;
}

// 3.8.1 Duration
interface XmlVASTDuration {
    _text: string;
}

// 3.8.2 AdParameters
interface XmlVASTAdParameters {
    _attributes: XmlVASTAdParametersAttributes;
    _cdata: string;
}

interface XmlVASTAdParametersAttributes {
    xmlEncoded: string;
}

// 3.9 MediaFiles
interface XmlVASTMediaFiles {
    MediaFile: XmlVASTMediaFile | XmlVASTMediaFile[];
    Mezzanine?: XmlVASTMezzanine | XmlVASTMezzanine[];
    InteractiveCreativeFile?: XmlVASTInteractiveCreativeFile | XmlVASTInteractiveCreativeFile[];
    ClosedCaptionFiles: XmlVASTClosedCaptionFiles;
}

// 3.9.1 MediaFile
interface XmlVASTMediaFile {
    _attributes: XmlVASTMediaFileAttributes;
    _cdata: string;
}

interface XmlVASTMediaFileAttributes {
    delivery: string;
    type: string;
    width: string;
    height: string;
    codec?: string;
    id?: string;
    bitrate?: string;
    minBitrate?: string;
    maxBitrate?: string;
    scalable?: string;
    maintainAspectRatio?: string;
    apiFramework?: string; // Deprecated in 4.1 in preparation for VPAID being phased out
    fileSize?: string;
    mediaType?: string;
}

// 3.9.2 Mezzanine
interface XmlVASTMezzanine {
    _attributes: XmlVASTMezzanineAttributes;
    _cdata: string;
}

interface XmlVASTMezzanineAttributes {
    delivery: string;
    type: string;
    width: string;
    height: string;
    codec?: string;
    id?: string;
    fileSize?: string;
    mediaType?: string;
}

// 3.9.3 InteractiveCreativeFile
interface XmlVASTInteractiveCreativeFile {
    _attributes: XmlVASTInteractiveCreativeFileAttributes;
    _cdata: string;
}

interface XmlVASTInteractiveCreativeFileAttributes {
    type?: string;
    apiFramework?: string;
    variableDuration?: string;
}

// 3.9.4 ClosedCaptionFiles
interface XmlVASTClosedCaptionFiles {
    ClosedCaptionFile?: XmlVASTClosedCaptionFile | XmlVASTClosedCaptionFile[];
}

// 3.9.5 ClosedCaptionFile
interface XmlVASTClosedCaptionFile {
    _attributes?: XmlVASTClosedCaptionFileAttributes;
    _cdata: string;
}

interface XmlVASTClosedCaptionFileAttributes {
    type?: string;
    language?: string;
}

// 3.10 VideoClicks
interface XmlVASTVideoClicks {
    ClickThrough?: XmlVASTClickThrough;
    ClickTracking?: XmlVASTClickTracking | XmlVASTClickTracking[];
    CustomClick?: XmlVASTCustomClick | XmlVASTCustomClick[];
}

// 3.10.1 ClickThrough
interface XmlVASTClickThrough {
    _attributes?: XmlVASTClickThroughAttributes;
    _cdata: string;
}

interface XmlVASTClickThroughAttributes {
    id: string;
}

// 3.10.2 ClickTracking
interface XmlVASTClickTracking {
    _attributes?: XmlVASTClickTrackingAttributes;
    _cdata: string;
}

interface XmlVASTClickTrackingAttributes {
    id: string;
}

// 3.10.3 CustomClick
interface XmlVASTCustomClick {
    _attributes?: XmlVASTCustomClickAttributes;
    _cdata: string;
}

interface XmlVASTCustomClickAttributes {
    id: string;
}

// 3.11 Icons
interface XmlVASTIcons {
    Icon: XmlVASTIcon | XmlVASTIcon[];
}

// 3.11.1 Icon
interface XmlVASTIcon {
    _attributes?: XmlVASTIconAttributes;
    IconViewTracking?: XmlVASTIconViewTracking | XmlVASTIconViewTracking[];
    IconClicks?: XmlVASTIconClicks;
}

interface XmlVASTIconAttributes {
    program?: string;
    width?: string;
    height?: string;
    xPosition?: string;
    yPosition?: string;
    duration?: string;
    offset?: string;
    apiFramework?: string;
    pxratio?: string;
    altText?: string;
    hoverText?: string;
}

// 3.11.2 IconViewTracking
interface XmlVASTIconViewTracking {
    _cdata: string;
}

// 3.11.3 IconClicks
interface XmlVASTIconClicks {
    IconClickThrough?: XmlVASTIconClickThrough;
    IconClickTracking?: XmlVASTIconClickTracking | XmlVASTIconClickTracking[];
    IconClickFallbackImages?: XmlVASTIconClickTracking;
}

// 3.11.4 IconClickThrough
interface XmlVASTIconClickThrough {
    _cdata: string;
}

// 3.11.5 IconClickTracking
interface XmlVASTIconClickTracking {
    _attributes?: XmlVASTIconClickTrackingAttributes;
    _cdata: string;
}

interface XmlVASTIconClickTrackingAttributes {
    id: string;
}

// 3.11.6 IconClickFallbackImages
interface XmlVASTIconClickFallbackImages {
    IconClickFallbackImage: XmlVASTIconClickFallbackImage | XmlVASTIconClickFallbackImage[];
}

// 3.11.6.1 IconClickFallbackImage
interface XmlVASTIconClickFallbackImage {
    _attributes: XmlVASTIconClickFallbackImageAttributes;
    _cdata: string;
}

interface XmlVASTIconClickFallbackImageAttributes {
    width: string;
    height: string;
}

// 3.12 NonLinearAds
interface XmlVASTNonLinearAds {
    NonLinear: XmlVASTNonLinear | XmlVASTNonLinear[];
    TrackingEvents: XmlVASTTrackingEvents;
}

interface XmlVASTTrackingEvents {
    Tracking: XmlVASTTracking | XmlVASTTracking[];
}

// 3.12.1 NonLinear
interface XmlVASTNonLinear {
    _attributes: XmlVASTNonLinearAttributes;
    NonLinearClickTracking?: XmlVASTNonLinearClickTracking | XmlVASTNonLinearClickTracking[];
}

interface XmlVASTNonLinearAttributes {
    id?: string;
    width: string;
    height: string;
    expandedWidth?: string;
    expandedHeight?: string;
    scalable?: string;
    maintainAspectRatio?: string;
    apiFramework?: string;
    minSuggestedDuration?: string;
}

interface XmlVASTNonLinearInInLine extends XmlVASTNonLinear {
    // StaticResource?: XmlVASTStaticResource;
    // IFrameResource?: XmlVASTIFrameResource;
    // HTMLResource?: XmlVASTHTMLResource;
    // AdParameters?: XmlVASTAdParameters;
    NonLinearClickThrough?: XmlVASTNonLinearClickThrough;
}

// 3.12.2 NonLinearClickThrough
interface XmlVASTNonLinearClickThrough {
    _cdata: string;
}

// 3.12.3 NonLinearClickTracking
interface XmlVASTNonLinearClickTracking {
    _attributes?: XmlVASTNonLinearClickTrackingAttributes;
    _cdata: string;
}

interface XmlVASTNonLinearClickTrackingAttributes {
    id: string;
}

// 3.19 Wrapper
interface XmlVASTWrapper {
    AdSystem: XmlVASTAdSystem;
    Impression: XmlVASTImpression | XmlVASTImpression[];
    Pricing?: XmlVASTPricing;
    Error?: XmlVASTError | XmlVASTError[];
    ViewableImpression?: XmlVASTViewableImpression;
    Creatives?: XmlVASTCreatives;
}

interface XmlVASTTracking {
    _attributes: XmlVASTTrackingAttributes;
    _cdata: string;
}

interface XmlVASTTrackingAttributes {
    event: LinearAdMetric;
}

type LinearAdMetric = 'loaded' | 'start' | 'firstQuartile' | 'midpoint' | 'thirdQuartile' | 'complete' | 'otherAdInteraction' | 'progress' | 'closeLinear';

interface XmlVASTExtensions {
    Extension: XmlVASTExtension | XmlVASTExtension[];
}

interface XmlVASTExtension {
    _attributes?: XmlVASTExtensionAttributes;
    [key: string]: convert.ElementCompact | undefined;
}

interface XmlVASTExtensionAttributes {
    type: string;
}
