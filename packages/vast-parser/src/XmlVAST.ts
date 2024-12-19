// 3.2 VAST
export interface XmlVAST extends Element {
    tagName: 'VAST';
    childNodes: NodeListOf<XmlVASTAd | XmlVASTError>;
}

export interface XmlParserError extends Element {
    tagName: 'parsererror';
}

// 3.2.1 Error (VAST)
interface XmlVASTError extends Element {
    tagName: 'Error';
}

// 3.3 Ad
interface XmlVASTAd extends Element {
    tagName: 'Ad';
    childNodes: NodeListOf<XmlVASTInLine | XmlVASTWrapper>;
}

// 3.4 InLine
interface XmlVASTInLine extends Element {
    tagName: 'InLine';
    childNodes: NodeListOf<XmlVASTAdSystem | XmlVASTAdTitle | XmlVASTAdServingId | XmlVASTImpression | XmlVASTCategory | XmlVASTDescription | XmlVASTAdvertiser | XmlVASTPricing | XmlVASTSurvey | XmlVASTExpires | XmlVASTError | XmlVASTViewableImpression | XmlVASTCreativesInInLine | XmlVASTExtensions>;
}

// 3.4.1 AdSystem
interface XmlVASTAdSystem extends Element {
    tagName: 'AdSystem';
}

// 3.4.2 AdTitle
interface XmlVASTAdTitle extends Element {
    tagName: 'AdTitle';
}

// 3.4.3 AdServingId
interface XmlVASTAdServingId extends Element {
    tagName: 'AdServingId';
}

// 3.4.4 Impression
interface XmlVASTImpression extends Element {
    tagName: 'Impression';
}

// 3.4.5 Category
interface XmlVASTCategory extends Element {
    tagName: 'Category';
}

// 3.4.6 Description
interface XmlVASTDescription extends Element {
    tagName: 'Description';
}

// 3.4.7 Advertiser
interface XmlVASTAdvertiser extends Element {
    tagName: 'Advertiser';
}

// 3.4.8 Pricing
interface XmlVASTPricing extends Element {
    tagName: 'Pricing';
}

// 3.4.9 Survey
interface XmlVASTSurvey extends Element {
    tagName: 'Survey';
}

// 3.4.10 Expires
interface XmlVASTExpires extends Element {
    tagName: 'Expires';
}

// 3.4.11 Error
interface XmlVASTError extends Element {
    tagName: 'Error';
}

// 3.5 ViewableImpression
interface XmlVASTViewableImpression extends Element {
    tagName: 'ViewableImpression';
    childNodes: NodeListOf<XmlVASTViewable | XmlVASTNotViewable | XmlVASTViewUndetermined>;
}

// 3.5.1 Viewable
interface XmlVASTViewable extends Element {
    tagName: 'Viewable';
}

// 3.5.2 NotViewable
interface XmlVASTNotViewable extends Element {
    tagName: 'NotViewable';
}

// 3.5.3 ViewUndetermined
interface XmlVASTViewUndetermined extends Element {
    tagName: 'ViewUndetermined';
}

// 3.6 Creatives
interface XmlVASTCreatives extends Element {
    tagName: 'Creatives';
    childNodes: NodeListOf<XmlVASTCreative>;
}

interface XmlVASTCreativesInInLine extends Element {
    tagName: 'Creatives';
    childNodes: NodeListOf<XmlVASTCreativeInInLine>;
}

// 3.7 Creative
interface XmlVASTCreative extends Element {
    tagName: 'Creative';
    childNodes: NodeListOf<XmlVASTLinear | XmlVASTNonLinearAds>;
}

interface XmlVASTCreativeInInLine extends Element {
    tagName: 'Creative';
    childNodes: NodeListOf<XmlVASTUniversalAdId | XmlVASTCreativeExtensions | XmlVASTLinearInInLine>;
}

// 3.7.1 UniversalAdId
interface XmlVASTUniversalAdId extends Element {
tagName: 'UniversalAdId';
}

// 3.7.2 CreativeExtensions
interface XmlVASTCreativeExtensions extends Element {
    tagName: 'CreativeExtensions';
    childNodes: NodeListOf<XmlVASTCreativeExtension>;
}

// 3.7.3 CreativeExtension
interface XmlVASTCreativeExtension extends Element {
    tagName: 'CreativeExtension';
}

// 3.8 Linear
interface XmlVASTLinear extends Element {
    tagName: 'Linear';
    childNodes: NodeListOf<XmlVASTTrackingEvents | XmlVASTVideoClicks | XmlVASTIcons>;
}

interface XmlVASTLinearInInLine extends Element {
    tagName: 'Linear';
    childNodes: NodeListOf<XmlVASTDuration | XmlVASTAdParameters | XmlVASTMediaFiles>;
}

// 3.8.1 Duration
interface XmlVASTDuration extends Element {
    tagName: 'Duration';
}

// 3.8.2 AdParameters
interface XmlVASTAdParameters extends Element {
    tagName: 'AdParameters';
}

// 3.9 MediaFiles
interface XmlVASTMediaFiles extends Element {
    tagName: 'MediaFiles';
    childNodes: NodeListOf<XmlVASTMediaFile | XmlVASTMezzanine | XmlVASTInteractiveCreativeFile | XmlVASTClosedCaptionFiles>;
}

// 3.9.1 MediaFile
interface XmlVASTMediaFile extends Element {
    tagName: 'MediaFile';
}

// 3.9.2 Mezzanine
interface XmlVASTMezzanine extends Element {
    tagName: 'Mezzanine';
}

// 3.9.3 InteractiveCreativeFile
interface XmlVASTInteractiveCreativeFile extends Element {
    tagName: 'InteractiveCreativeFile';
}



// 3.9.4 ClosedCaptionFiles
interface XmlVASTClosedCaptionFiles extends Element {
    tagName: 'ClosedCaptionFiles';
    childNodes: NodeListOf<XmlVASTClosedCaptionFile>;
}

// 3.9.5 ClosedCaptionFile
interface XmlVASTClosedCaptionFile extends Element {
    tagName: 'ClosedCaptionFile';
}

// 3.10 VideoClicks
interface XmlVASTVideoClicks extends Element {
    tagName: 'VideoClicks';
    childNodes: NodeListOf<XmlVASTClickThrough | XmlVASTClickTracking | XmlVASTCustomClick>;
}

// 3.10.1 ClickThrough
interface XmlVASTClickThrough  extends Element {
    tagName: 'ClickThrough';
}

// 3.10.2 ClickTracking
interface XmlVASTClickTracking extends Element {
    tagName: 'ClickTracking';
}

// 3.10.3 CustomClick
interface XmlVASTCustomClick extends Element {
    tagName: 'CustomClick';
}

// 3.11 Icons
interface XmlVASTIcons extends Element {
    tagName: 'Icons';
    childNodes: NodeListOf<XmlVASTIcon>;
}

// 3.11.1 Icon
interface XmlVASTIcon extends Element {
    tagName: 'Icon';
    childNodes: NodeListOf<XmlVASTIconViewTracking | XmlVASTIconClicks>;
}

// 3.11.2 IconViewTracking
interface XmlVASTIconViewTracking extends Element {
    tagName: 'IconViewTracking';
}

// 3.11.3 IconClicks
interface XmlVASTIconClicks extends Element {
    tagName: 'IconClicks';
    childNodes: NodeListOf<XmlVASTIconClickThrough | XmlVASTIconClickTracking | XmlVASTIconClickFallbackImages>;
}

// 3.11.4 IconClickThrough
interface XmlVASTIconClickThrough extends Element {
    tagName: 'IconClickThrough';
}

// 3.11.5 IconClickTracking
interface XmlVASTIconClickTracking extends Element {
    tagName: 'IconClickTracking';
}

// 3.11.6 IconClickFallbackImages
interface XmlVASTIconClickFallbackImages extends Element {
    tagName: 'IconClickFallbackImages';
    childNodes: NodeListOf<XmlVASTIconClickFallbackImage>;
}

// 3.11.6.1 IconClickFallbackImage
interface XmlVASTIconClickFallbackImage extends Element {
    tagName: 'IconClickFallbackImage';
}

// 3.12 NonLinearAds
interface XmlVASTNonLinearAds extends Element {
    tagName: 'NonLinearAds';
    childNodes: NodeListOf<XmlVASTNonLinear | XmlVASTTrackingEvents>;
}

interface XmlVASTTrackingEvents extends Element {
    tagName: 'TrackingEvents';
    childNodes: NodeListOf<XmlVASTTracking>;
}

// 3.12.1 NonLinear
interface XmlVASTNonLinear extends Element {
    tagName: 'NonLinear';
    childNodes: NodeListOf<XmlVASTNonLinearClickTracking>;
}

interface XmlVASTNonLinearInInLine extends Element {
    tagName: 'NonLinear';
    childNodes: NodeListOf<XmlVASTNonLinearClickThrough>;
}

// 3.12.2 NonLinearClickThrough
interface XmlVASTNonLinearClickThrough extends Element {
    tagName: 'NonLinearClickThrough';
}

// 3.12.3 NonLinearClickTracking
interface XmlVASTNonLinearClickTracking extends Element {
    tagName: 'NonLinearClickTracking';
}

// 3.19 Wrapper
interface XmlVASTWrapper extends Element {
    tagName: 'Wrapper';
    childNodes: NodeListOf<XmlVASTAdSystem | XmlVASTImpression | XmlVASTPricing | XmlVASTError | XmlVASTViewableImpression | XmlVASTCreatives>;
}

interface XmlVASTTracking extends Element {
    tagName: 'Tracking';
}

interface XmlVASTExtensions extends Element {
    tagName: 'Extensions';
    childNodes: NodeListOf<XmlVASTExtension>;
}

interface XmlVASTExtension extends Element {
    tagName: 'Extension';
}
