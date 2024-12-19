import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import type Ad from '../src/Ad';
import type InLine from '../src/InLine';
import VASTParser from '../src/VASTParser';
import * as ENV from './setup/env';

const test = suite('VASTParser');

test.before(ENV.setup);

test('parse normal VAST', () => {
    let vast: string;
    let parser: VASTParser;
    let ad: Ad;
    let inLine: InLine;

    vast = `
        <?xml version="1.0" encoding="UTF-8"?>
        <VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">
            <Ad sequence="1">
                <InLine>
                    <AdSystem>SSP</AdSystem>
                    <AdTitle>DSP></AdTitle>
                    <Impression><![CDATA[https://example.com/vast/ad/1/impression/1]]></Impression>
                    <Impression><![CDATA[https://example.com/vast/ad/1/impression/2]]></Impression>
                    <Description></Description>
                    <Advertiser>example.com</Advertiser>
                    <Survey type=""></Survey>
                    <Error><![CDATA[https://example.com/vast/preroll-ad-1/ad/1/error/1]]></Error>
                    <Error><![CDATA[https://example.com/vast/preroll-ad-1/ad/1/error/2]]></Error>
                    <Extensions>
                        <Extension type="type-1"><Root><ID><![CDATA[cdata]]></ID></Root></Extension>
                        <Extension type="type-2"><Creative><Name>4237</Name><Duration>10</Duration></Creative></Extension>
                    </Extensions>
                    <Creatives>
                        <Creative id="1">
                        <Linear>
                            <Duration>00:00:10</Duration>
                            <TrackingEvents>
                                <Tracking event="start"><![CDATA[https://example.com/vast/ad/1/creative/1/tracking/start]]></Tracking>
                                <Tracking event="firstQuartile"><![CDATA[https://example.com/vast/ad/1/creative/1/tracking/firstQuartile]]></Tracking>
                                <Tracking event="midpoint"><![CDATA[https://example.com/vast/ad/1/creative/1/tracking/midpoint]]></Tracking>
                                <Tracking event="thirdQuartile"><![CDATA[https://example.com/vast/ad/1/creative/1/tracking/thirdQuartile]]></Tracking>
                                <Tracking event="complete"><![CDATA[https://example.com/vast/ad/1/creative/1/tracking/complete]]></Tracking>
                            </TrackingEvents>
                            <MediaFiles>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="4000" width="1920" height="1080"><![CDATA[https://example.com/media/vod-4000k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="2000" width="1280" height="720"><![CDATA[https://example.com/media/vod-2000k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="1200" width="854" height="480"><![CDATA[https://example.com/media/vod-1200k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="800" width="640" height="360"><![CDATA[https://example.com/media/vod-800k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="240" width="426" height="240"><![CDATA[https://example.com/media/vod-240k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="120" width="320" height="180"><![CDATA[https://example.com/media/vod-120k-5.mp4]]></MediaFile>
                            </MediaFiles>
                        </Linear>
                        <CreativeExtensions>
                            <CreativeExtension type="abema"><BrandID>4237</BrandID></CreativeExtension>
                        </CreativeExtensions>
                        </Creative>
                    </Creatives>
                </InLine>
            </Ad>
            <Ad sequence="2">
                <InLine>
                    <AdSystem>SSP</AdSystem>
                    <AdTitle>DSP></AdTitle>
                    <Impression><![CDATA[https://example.com/vast/ad/2/impression/1]]></Impression>
                    <Impression><![CDATA[https://example.com/vast/ad/2/impression/2]]></Impression>
                    <Description></Description>
                    <Advertiser>example.com</Advertiser>
                    <Survey type=""></Survey>
                    <Error><![CDATA[https://example.com/vast/preroll-ad-1/ad/2/error/1]]></Error>
                    <Error><![CDATA[https://example.com/vast/preroll-ad-1/ad/2/error/2]]></Error>
                    <Extensions>
                    </Extensions>
                    <Creatives>
                        <Creative id="1">
                        <Linear>
                            <Duration>00:00:10</Duration>
                            <TrackingEvents>
                                <Tracking event="start"><![CDATA[https://example.com/vast/ad/2/creative/1/tracking/start]]></Tracking>
                                <Tracking event="firstQuartile"><![CDATA[https://example.com/vast/ad/2/creative/1/tracking/firstQuartile]]></Tracking>
                                <Tracking event="midpoint"><![CDATA[https://example.com/vast/ad/2/creative/1/tracking/midpoint]]></Tracking>
                                <Tracking event="thirdQuartile"><![CDATA[https://example.com/vast/ad/2/creative/1/tracking/thirdQuartile]]></Tracking>
                                <Tracking event="complete"><![CDATA[https://example.com/vast/ad/2/creative/1/tracking/complete]]></Tracking>
                            </TrackingEvents>
                            <MediaFiles>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="4000" width="1920" height="1080"><![CDATA[https://example.com/media/vod-4000k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="2000" width="1280" height="720"><![CDATA[https://example.com/media/vod-2000k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="1200" width="854" height="480"><![CDATA[https://example.com/media/vod-1200k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="800" width="640" height="360"><![CDATA[https://example.com/media/vod-800k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="240" width="426" height="240"><![CDATA[https://example.com/media/vod-240k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="120" width="320" height="180"><![CDATA[https://example.com/media/vod-120k-5.mp4]]></MediaFile>
                            </MediaFiles>
                        </Linear>
                        <CreativeExtensions>
                            <CreativeExtension type="type-1"><ID>4237</ID></CreativeExtension>
                        </CreativeExtensions>
                        </Creative>
                    </Creatives>
                </InLine>
            </Ad>
            <Ad>
                <InLine>
                    <AdSystem>SSP</AdSystem>
                    <AdTitle>DSP></AdTitle>
                    <Impression><![CDATA[https://example.com/vast/ad/3/impression/1]]></Impression>
                    <Impression><![CDATA[https://example.com/vast/ad/3/impression/2]]></Impression>
                    <Description></Description>
                    <Advertiser>example.com</Advertiser>
                    <Survey type=""></Survey>
                    <Error><![CDATA[https://example.com/vast/ad/3/error/1]]></Error>
                    <Error><![CDATA[https://example.com/vast/ad/3/error/2]]></Error>
                    <Extensions>
                    </Extensions>
                    <Creatives>
                        <Creative id="1">
                        <Linear>
                            <Duration>00:00:10</Duration>
                            <TrackingEvents>
                                <Tracking event="start"><![CDATA[https://example.com/vast/ad/3/creative/1/tracking/start]]></Tracking>
                                <Tracking event="firstQuartile"><![CDATA[https://example.com/vast/ad/3/creative/1/tracking/firstQuartile]]></Tracking>
                                <Tracking event="midpoint"><![CDATA[https://example.com/vast/ad/3/creative/1/tracking/midpoint]]></Tracking>
                                <Tracking event="thirdQuartile"><![CDATA[https://example.com/vast/ad/3/creative/1/tracking/thirdQuartile]]></Tracking>
                                <Tracking event="complete"><![CDATA[https://example.com/vast/ad/3/creative/1/tracking/complete]]></Tracking>
                            </TrackingEvents>
                            <MediaFiles>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="4000" width="1920" height="1080"><![CDATA[https://example.com/media/vod-4000k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="2000" width="1280" height="720"><![CDATA[https://example.com/media/vod-2000k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="1200" width="854" height="480"><![CDATA[https://example.com/media/vod-1200k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="800" width="640" height="360"><![CDATA[https://example.com/media/vod-800k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="240" width="426" height="240"><![CDATA[https://example.com/media/vod-240k-5.mp4]]></MediaFile>
                                <MediaFile delivery="progressive" type="video/mp4" bitrate="120" width="320" height="180"><![CDATA[https://example.com/media/vod-120k-5.mp4]]></MediaFile>
                            </MediaFiles>
                        </Linear>
                        <CreativeExtensions>
                            <CreativeExtension type="type-1"><ID>4237</ID></CreativeExtension>
                        </CreativeExtensions>
                        </Creative>
                    </Creatives>
                </InLine>
            </Ad>
        </VAST>
    `;
    parser = new VASTParser(vast);
    const parsedVAST = parser.parse();
    if (parsedVAST === null) {
        assert.unreachable();
        return;
    }

    assert.is(parsedVAST.ads.length, 3);

    ad = parsedVAST.ads[0];
    assert.is(ad.sequence, 1);

    inLine = ad.inLine!;
    assert.is(inLine.errors.length, 2, 'Ad 1 should have 2 errors');
    assert.is(inLine.errors[0], 'https://example.com/vast/preroll-ad-1/ad/1/error/1');
    assert.is(inLine.errors[1], 'https://example.com/vast/preroll-ad-1/ad/1/error/2');
    assert.is(inLine.extensions.length, 2, 'Ad 1 should have 2 extensions');
    assert.is(inLine.extensions[0].type, 'type-1', 'AD 1 extension 0 should have type "type-1"');
    assert.is(inLine.extensions[0].customXML, '<Root><ID><![CDATA[cdata]]></ID></Root>');
    assert.is(inLine.extensions[1].type, 'type-2', 'AD 1 extension 1 should have type "type-2"');
    assert.is(inLine.extensions[1].customXML, '<Creative><Name>4237</Name><Duration>10</Duration></Creative>', '');
    assert.is(inLine.creatives[0].linear!.duration, 10);
    assert.is(inLine.creatives[0].linear!.mediaFiles[0].bitrate, 4000);
    assert.is(inLine.creatives[0].linear!.mediaFiles[5].bitrate, 120);

    ad = parsedVAST.ads[2];
    assert.is(ad.sequence, void 0);
});

test('parse no AdBreak VAST', () => {
    let vast: string;
    let parser: VASTParser;

    vast = `
        <?xml version="1.0" encoding="UTF-8"?>
        <VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">
        </VAST>
    `;
    parser = new VASTParser(vast);
    const parsedVAST = parser.parse();
    if (parsedVAST === null) {
        assert.unreachable();
        return;
    }

    assert.is(parsedVAST.ads.length, 0);
});

test.run();
