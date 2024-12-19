import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import IABClient, { sortAdsBySequence } from '../src/IABClient';
import { OmapClientEvent, IHttpClient, AdPodInsertionRequest, AdPod, Ad } from "@ygoto3/omap-core";
import { Ad as ParserAd } from '@ygoto3/omap-vast-parser';
import * as ENV from './setup/env';


const test = suite('IABClient');

test.before(ENV.setup);

test('adTagUrl is vmap', async () => {
    const adTagUrl = 'https://example.com/vmap';
    const httpClient = new MockHttpClient();
    httpClient.registerGetFunction(get_function);
    const adClient = new IABClient(adTagUrl, httpClient);

    let content_pause_requested_count = 0;
    let content_resume_requested_count = 0;
    let content_can_play_count = 0;
    let ad_pod_preparation_requested_count = 0;
    let ad_pod: AdPod;
    let ad_pod_prepared: AdPod;
    let ad: Ad;

    const vmap_loaded = createPromise();

    const preroll_1 = createPromise();

    const preroll_1_ad_1_impression_1 = createPromise();
    const preroll_1_ad_1_impression_2 = createPromise();
    const preroll_1_ad_1_error_1 = createPromise();
    const preroll_1_ad_1_error_2 = createPromise();
    const ad_1_creative_1_tracking_start = createPromise();
    const ad_1_creative_1_tracking_firstQuartile = createPromise();
    const ad_1_creative_1_tracking_midpoint = createPromise();
    const ad_1_creative_1_tracking_thirdQuartile = createPromise();
    const ad_1_creative_1_tracking_complete = createPromise();

    const ad_2_impression_1 = createPromise();
    const ad_2_impression_2 = createPromise();
    const ad_2_creative_1_tracking_start = createPromise();
    const ad_2_creative_1_tracking_firstQuartile = createPromise();
    const ad_2_creative_1_tracking_midpoint = createPromise();
    const ad_2_creative_1_tracking_thirdQuartile = createPromise();
    const ad_2_creative_1_tracking_complete = createPromise();

    const midroll_1 = createPromise();

    const midroll_1_ad_1_impression_1 = createPromise();
    const midroll_1_ad_1_creative_1_tracking_start = createPromise();
    const midroll_1_ad_1_creative_1_tracking_firstQuartile = createPromise();
    const midroll_1_ad_1_creative_1_tracking_midpoint = createPromise();
    const midroll_1_ad_1_creative_1_tracking_thirdQuartile = createPromise();
    const midroll_1_ad_1_creative_1_tracking_complete = createPromise();

    const midroll_2 = createPromise();

    const midroll_2_ad_1_impression_1 = createPromise();
    const midroll_2_ad_1_creative_1_tracking_start = createPromise();
    const midroll_2_ad_1_creative_1_tracking_firstQuartile = createPromise();
    const midroll_2_ad_1_creative_1_tracking_midpoint = createPromise();
    const midroll_2_ad_1_creative_1_tracking_thirdQuartile = createPromise();
    const midroll_2_ad_1_creative_1_tracking_complete = createPromise();

    const midroll_2_ad_2_impression_1 = createPromise();
    const midroll_2_ad_2_creative_1_tracking_start = createPromise();
    const midroll_2_ad_2_creative_1_tracking_firstQuartile = createPromise();
    const midroll_2_ad_2_creative_1_tracking_midpoint = createPromise();
    const midroll_2_ad_2_creative_1_tracking_thirdQuartile = createPromise();
    const midroll_2_ad_2_creative_1_tracking_complete = createPromise();

    adClient.on(OmapClientEvent.CONTENT_PAUSE_REQUESTED, () => {
        content_pause_requested_count++;
    });
    adClient.on(OmapClientEvent.CONTENT_RESUME_REQUESTED, () => {
        content_resume_requested_count++;
    });
    adClient.on(OmapClientEvent.CONTENT_CAN_PLAY, () => {
        content_can_play_count++;
    });
    adClient.on(OmapClientEvent.ALL_ADS_COMPLETED, () => {});
    adClient.on(OmapClientEvent.LOADED, () => vmap_loaded.resolve());
    adClient.on(OmapClientEvent.LOAD_ERROR, () => {});
    adClient.on(OmapClientEvent.STARTED, () => {});
    adClient.on(OmapClientEvent.COMPLETE, () => {});
    adClient.on(OmapClientEvent.AD_POD_PREPARATION_REQUESTED, (adPodInsertionRequest: AdPodInsertionRequest) => {
        ad_pod_prepared = adPodInsertionRequest.adPod;
        ad_pod_preparation_requested_count++;
    });
    adClient.on(OmapClientEvent.AD_POD_INSERTION_REQUESTED, (adPodInsertionRequest: AdPodInsertionRequest) => {
        ad_pod = adPodInsertionRequest.adPod;
    });

    function get_function(url: string) {
        switch (url) {
            case adTagUrl:
                return Promise.resolve(`
                    <?xml version="1.0" encoding="UTF-8"?>
                    <vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
                        <vmap:AdBreak timeOffset="start" breakType="linear" breakId="preroll">
                            <vmap:AdSource id="preroll-ad-1" allowMultipleAds="false" followRedirects="true">
                                <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/preroll-ad-1]]></vmap:AdTagURI>
                            </vmap:AdSource>
                        </vmap:AdBreak>
                        <vmap:AdBreak timeOffset="00:00:15.000" breakType="linear" breakId="midroll-1">
                            <vmap:AdSource id="midroll-1-ad-1" allowMultipleAds="false" followRedirects="true">
                                <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/midroll-1]]></vmap:AdTagURI>
                            </vmap:AdSource>
                        </vmap:AdBreak>
                        <vmap:AdBreak timeOffset="00:00:30.000" breakType="linear" breakId="midroll-2">
                            <vmap:AdSource id="midroll-2-ad-1" allowMultipleAds="false" followRedirects="true">
                                <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/midroll-2]]></vmap:AdTagURI>
                            </vmap:AdSource>
                        </vmap:AdBreak>
                        <vmap:AdBreak timeOffset="00:00:45.000" breakType="linear" breakId="midroll-3">
                            <vmap:AdSource id="midroll-3-ad-1" allowMultipleAds="false" followRedirects="true">
                                <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/midroll-3]]></vmap:AdTagURI>
                            </vmap:AdSource>
                        </vmap:AdBreak>
                        <vmap:AdBreak timeOffset="end" breakType="linear" breakId="postroll">
                            <vmap:AdSource id="postroll-ad-1" allowMultipleAds="false" followRedirects="true">
                                <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/postroll-ad-1]]></vmap:AdTagURI>
                            </vmap:AdSource>
                        </vmap:AdBreak>
                    </vmap:VMAP>
                `);
            case 'https://example.com/vast/preroll-ad-1':
                preroll_1.resolve();
                return Promise.resolve(`
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
                    </VAST>
                `);
            case 'https://example.com/vast/midroll-1':
                midroll_1.resolve();
                return Promise.resolve(`
                    <?xml version="1.0" encoding="UTF-8"?>
                    <VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">
                        <Ad sequence="1">
                            <InLine>
                                <AdSystem>SSP</AdSystem>
                                <AdTitle>DSP></AdTitle>
                                <Impression><![CDATA[https://example.com/vast/midroll-1/ad/1/impression/1]]></Impression>
                                <Impression></Impression>
                                <Description></Description>
                                <Advertiser>example.com</Advertiser>
                                <Survey type=""></Survey>
                                <Error><![CDATA[https://example.com/vast/midroll-1/ad/1/error/1]]></Error>
                                <Error><![CDATA[https://example.com/vast/midroll-1/ad/1/error/2]]></Error>
                                <Creatives>
                                    <Creative id="1">
                                    <Linear>
                                        <Duration>00:00:10</Duration>
                                        <TrackingEvents>
                                            <Tracking event="start"><![CDATA[https://example.com/vast/midroll-1/ad/1/creative/1/tracking/start]]></Tracking>
                                            <Tracking event="firstQuartile"><![CDATA[https://example.com/vast/midroll-1/ad/1/creative/1/tracking/firstQuartile]]></Tracking>
                                            <Tracking event="midpoint"><![CDATA[https://example.com/vast/midroll-1/ad/1/creative/1/tracking/midpoint]]></Tracking>
                                            <Tracking event="thirdQuartile"><![CDATA[https://example.com/vast/midroll-1/ad/1/creative/1/tracking/thirdQuartile]]></Tracking>
                                            <Tracking event="complete"><![CDATA[https://example.com/vast/midroll-1/ad/1/creative/1/tracking/complete]]></Tracking>
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
                `);
            case 'https://example.com/vast/midroll-2':
                midroll_2.resolve();
                return Promise.resolve(`
                    <?xml version="1.0" encoding="UTF-8"?>
                    <VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">
                        <Ad>
                            <InLine>
                                <AdSystem>SSP</AdSystem>
                                <AdTitle>DSP></AdTitle>
                                <Impression><![CDATA[https://example.com/vast/midroll-2/ad/1/impression/1]]></Impression>
                                <Impression></Impression>
                                <Description></Description>
                                <Advertiser>example.com</Advertiser>
                                <Survey type=""></Survey>
                                <Error><![CDATA[https://example.com/vast/midroll-2/ad/2/error/1]]></Error>
                                <Error><![CDATA[https://example.com/vast/midroll-2/ad/2/error/2]]></Error>
                                <Creatives>
                                    <Creative id="1">
                                    <Linear>
                                        <Duration>00:00:10</Duration>
                                        <TrackingEvents>
                                            <Tracking event="start"><![CDATA[https://example.com/vast/midroll-2/ad/1/creative/1/tracking/start]]></Tracking>
                                            <Tracking event="firstQuartile"><![CDATA[https://example.com/vast/midroll-2/ad/1/creative/1/tracking/firstQuartile]]></Tracking>
                                            <Tracking event="midpoint"><![CDATA[https://example.com/vast/midroll-2/ad/1/creative/1/tracking/midpoint]]></Tracking>
                                            <Tracking event="thirdQuartile"><![CDATA[https://example.com/vast/midroll-2/ad/1/creative/1/tracking/thirdQuartile]]></Tracking>
                                            <Tracking event="complete"><![CDATA[https://example.com/vast/midroll-2/ad/1/creative/1/tracking/complete]]></Tracking>
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
                        <Ad sequence="2">
                            <InLine>
                                <AdSystem>SSP</AdSystem>
                                <AdTitle>DSP></AdTitle>
                                <Impression><![CDATA[https://example.com/vast/midroll-2/ad/2/impression/1]]></Impression>
                                <Impression></Impression>
                                <Description></Description>
                                <Advertiser>example.com</Advertiser>
                                <Survey type=""></Survey>
                                <Error><![CDATA[https://example.com/vast/midroll-2/ad/2/error/1]]></Error>
                                <Error><![CDATA[https://example.com/vast/midroll-2/ad/2/error/2]]></Error>
                                <Creatives>
                                    <Creative id="1">
                                    <Linear>
                                        <Duration>00:00:10</Duration>
                                        <TrackingEvents>
                                            <Tracking event="start"><![CDATA[https://example.com/vast/midroll-2/ad/2/creative/1/tracking/start]]></Tracking>
                                            <Tracking event="firstQuartile"><![CDATA[https://example.com/vast/midroll-2/ad/2/creative/1/tracking/firstQuartile]]></Tracking>
                                            <Tracking event="midpoint"><![CDATA[https://example.com/vast/midroll-2/ad/2/creative/1/tracking/midpoint]]></Tracking>
                                            <Tracking event="thirdQuartile"><![CDATA[https://example.com/vast/midroll-2/ad/2/creative/1/tracking/thirdQuartile]]></Tracking>
                                            <Tracking event="complete"><![CDATA[https://example.com/vast/midroll-2/ad/2/creative/1/tracking/complete]]></Tracking>
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
                `);
            case 'https://example.com/vast/ad/1/impression/1':
                preroll_1_ad_1_impression_1.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/1/impression/2':
                preroll_1_ad_1_impression_2.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/preroll-ad-1/ad/1/error/1':
                preroll_1_ad_1_error_1.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/preroll-ad-1/ad/1/error/2':
                preroll_1_ad_1_error_2.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/1/creative/1/tracking/start':
                ad_1_creative_1_tracking_start.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/1/creative/1/tracking/firstQuartile':
                ad_1_creative_1_tracking_firstQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/1/creative/1/tracking/midpoint':
                ad_1_creative_1_tracking_midpoint.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/1/creative/1/tracking/thirdQuartile':
                ad_1_creative_1_tracking_thirdQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/1/creative/1/tracking/complete':
                ad_1_creative_1_tracking_complete.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/2/impression/1':
                ad_2_impression_1.resolve();
                return Promise.reject('');
            case 'https://example.com/vast/ad/2/impression/2':
                ad_2_impression_2.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/2/creative/1/tracking/start':
                ad_2_creative_1_tracking_start.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/2/creative/1/tracking/firstQuartile':
                ad_2_creative_1_tracking_firstQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/2/creative/1/tracking/midpoint':
                ad_2_creative_1_tracking_midpoint.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/2/creative/1/tracking/thirdQuartile':
                ad_2_creative_1_tracking_thirdQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/ad/2/creative/1/tracking/complete':
                ad_2_creative_1_tracking_complete.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-1/ad/1/impression/1':
                midroll_1_ad_1_impression_1.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-1/ad/1/creative/1/tracking/start':
                midroll_1_ad_1_creative_1_tracking_start.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-1/ad/1/creative/1/tracking/firstQuartile':
                midroll_1_ad_1_creative_1_tracking_firstQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-1/ad/1/creative/1/tracking/midpoint':
                midroll_1_ad_1_creative_1_tracking_midpoint.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-1/ad/1/creative/1/tracking/thirdQuartile':
                midroll_1_ad_1_creative_1_tracking_thirdQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-1/ad/1/creative/1/tracking/complete':
                midroll_1_ad_1_creative_1_tracking_complete.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/1/impression/1':
                midroll_2_ad_1_impression_1.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/1/creative/1/tracking/start':
                midroll_2_ad_1_creative_1_tracking_start.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/1/creative/1/tracking/firstQuartile':
                midroll_2_ad_1_creative_1_tracking_firstQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/1/creative/1/tracking/midpoint':
                midroll_2_ad_1_creative_1_tracking_midpoint.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/1/creative/1/tracking/thirdQuartile':
                midroll_2_ad_1_creative_1_tracking_thirdQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/1/creative/1/tracking/complete':
                midroll_2_ad_1_creative_1_tracking_complete.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/2/impression/1':
                midroll_2_ad_2_impression_1.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/2/creative/1/tracking/start':
                midroll_2_ad_2_creative_1_tracking_start.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/2/creative/1/tracking/firstQuartile':
                midroll_2_ad_2_creative_1_tracking_firstQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/2/creative/1/tracking/midpoint':
                midroll_2_ad_2_creative_1_tracking_midpoint.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/2/creative/1/tracking/thirdQuartile':
                midroll_2_ad_2_creative_1_tracking_thirdQuartile.resolve();
                return Promise.resolve('');
            case 'https://example.com/vast/midroll-2/ad/2/creative/1/tracking/complete':
                midroll_2_ad_2_creative_1_tracking_complete.resolve();
                return Promise.resolve('');
            default:
                return Promise.reject('Should not be called');
        }
    }

    await vmap_loaded.promise;
    adClient.play();

    assert.is(content_pause_requested_count, 0, 'Content pause should not be requested');
    assert.is(content_resume_requested_count, 0, 'Content resume should not be requested');

    adClient.notifyCurrentTime(0);
    await preroll_1.promise;

    await wait(); // CONTENT_PAUSE_REQUESTED is called asynchronously
    assert.is(content_pause_requested_count, 1, 'Content pause should be requested');

    // 1st ad
    ad = ad_pod!.ads[0];

    adClient.notifyAdStarted(ad);
    await preroll_1_ad_1_impression_1.promise;
    assert.ok(true, 'Impression 1 should be sent');
    await preroll_1_ad_1_impression_2.promise;
    assert.ok(true, 'Impression 2 should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 0.01, ad.sequence);
    await ad_1_creative_1_tracking_start.promise;
    assert.ok(true, 'Creative 1 tracking start should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 2.5, ad.sequence);
    await ad_1_creative_1_tracking_firstQuartile.promise;
    assert.ok(true, 'Creative 1 tracking firstQuartile should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 5.0, ad.sequence);
    await ad_1_creative_1_tracking_midpoint.promise;
    assert.ok(true, 'Creative 1 tracking midpoint should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 7.5, ad.sequence);
    await ad_1_creative_1_tracking_thirdQuartile.promise;
    assert.ok(true, 'Creative 1 tracking thirdQuartile should be sent');

    adClient.notifyAdPlaybackError(ad);
    await preroll_1_ad_1_error_1.promise;
    assert.ok(true, 'Ad 1 playback error 1 should be sent');
    await preroll_1_ad_1_error_2.promise;
    assert.ok(true, 'Ad 1 playback error 2 should be sent');

    adClient.notifyAdCreativeEnded(ad.adCreatives[0], ad.sequence);
    await ad_1_creative_1_tracking_complete.promise;
    assert.ok(true, 'Creative 1 tracking complete should be sent');

    // 2nd ad
    ad = ad_pod!.ads[1];

    adClient.notifyAdStarted(ad);
    await ad_2_impression_1.promise;
    assert.ok(true, 'Ad 2 Impression 1 should be sent');
    await ad_2_impression_2.promise;
    assert.ok(true, 'Ad 2 Impression 2 should be sent');

    await preroll_1_ad_1_error_1.promise;
    assert.ok(true, 'Ad 2 Impression 2 should fail to be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 0.1, ad.sequence);
    await ad_2_creative_1_tracking_start.promise;
    assert.ok(true, 'Ad 2 Creative 1 tracking start should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 2.5, ad.sequence);
    await ad_2_creative_1_tracking_firstQuartile.promise;
    assert.ok(true, 'Ad 2 Creative 1 tracking firstQuartile should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 5.0, ad.sequence);
    await ad_2_creative_1_tracking_midpoint.promise;
    assert.ok(true, 'Ad 2 Creative 1 tracking midpoint should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 7.5, ad.sequence);
    await ad_2_creative_1_tracking_thirdQuartile.promise;
    assert.ok(true, 'Ad 2 Creative 1 tracking thirdQuartile should be sent');

    adClient.notifyAdCreativeEnded(ad.adCreatives[0], ad.sequence);
    await ad_2_creative_1_tracking_complete.promise;
    assert.ok(true, 'Ad 2 Creative 1 tracking complete should be sent');

    if (ad_pod!.ads.length === ad.sequence) {
        adClient.notifyAdPodEnded();
    }

    assert.is(content_can_play_count, 1, 'Content can play should be notified');

    adClient.notifyCurrentTime(10);
    await wait(); // AD_POD_PREPARATION_REQUESTED is called asynchronously
    assert.is(ad_pod_preparation_requested_count, 1, 'Ad pod preparation should be requested');

    adClient.notifyCurrentTime(15);
    await midroll_1.promise;

    await wait(); // CONTENT_PAUSE_REQUESTED is called asynchronously
    assert.is(content_pause_requested_count, 2, 'Content pause should be requested');

    // midroll 1 - 1st ad
    ad = ad_pod!.ads[0];
    assert.is(ad.sequence, ad_pod_prepared!.ads[0].sequence, 'Ad should be the same as the one prefetched');

    adClient.notifyAdStarted(ad);
    await midroll_1_ad_1_impression_1.promise;
    assert.ok(true, 'Midroll 1 Impression 1 should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 0.2, ad.sequence);
    await midroll_1_ad_1_creative_1_tracking_start.promise;
    assert.ok(true, 'Midroll 1 Creative 1 tracking start should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 2.5, ad.sequence);
    await midroll_1_ad_1_creative_1_tracking_firstQuartile.promise;
    assert.ok(true, 'Midroll 1 Creative 1 tracking firstQuartile should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 5.0, ad.sequence);
    await midroll_1_ad_1_creative_1_tracking_midpoint.promise;
    assert.ok(true, 'Midroll 1 Creative 1 tracking midpoint should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 7.5, ad.sequence);
    await midroll_1_ad_1_creative_1_tracking_thirdQuartile.promise;
    assert.ok(true, 'Midroll 1 Creative 1 tracking thirdQuartile should be sent');

    adClient.notifyAdCreativeEnded(ad.adCreatives[0], ad.sequence);
    await midroll_1_ad_1_creative_1_tracking_complete.promise;
    assert.ok(true, 'Midroll 1 Creative 1 tracking complete should be sent');

    if (ad_pod!.ads.length === ad.sequence) {
        adClient.notifyAdPodEnded();
    }

    assert.is(content_resume_requested_count, 1, 'Content resume should be requested');

    adClient.notifyCurrentTime(25);
    await wait(); // AD_POD_PREPARATION_REQUESTED is called asynchronously
    assert.is(ad_pod_preparation_requested_count, 2, 'Ad pod preparation should be requested');

    adClient.notifyCurrentTime(30);
    await midroll_2.promise;

    await wait(); // CONTENT_PAUSE_REQUESTED is called asynchronously
    assert.is(content_pause_requested_count, 3, 'Content pause should be requested');

    // midroll 2 - 1st ad
    ad = ad_pod!.ads[0];
    assert.is(ad.sequence, ad_pod_prepared!.ads[0].sequence, 'Ad should be the same as the one prefetched');

    adClient.notifyAdStarted(ad);
    await midroll_2_ad_1_impression_1.promise;
    assert.ok(true, 'Midroll 2 Ad 1 Impression 1 should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 0.2, ad.sequence);
    await midroll_2_ad_1_creative_1_tracking_start.promise;
    assert.ok(true, 'Midroll 2 Ad 1 Creative 1 tracking start should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 2.5, ad.sequence);
    await midroll_2_ad_1_creative_1_tracking_firstQuartile.promise;
    assert.ok(true, 'Midroll 2 Ad 1 Creative 1 tracking firstQuartile should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 5.0, ad.sequence);
    await midroll_2_ad_1_creative_1_tracking_midpoint.promise;
    assert.ok(true, 'Midroll 2 Ad 1 Creative 1 tracking midpoint should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 7.5, ad.sequence);
    await midroll_2_ad_1_creative_1_tracking_thirdQuartile.promise;
    assert.ok(true, 'Midroll 2 Ad 1 Creative 1 tracking thirdQuartile should be sent');

    adClient.notifyAdCreativeEnded(ad.adCreatives[0], ad.sequence);
    await midroll_2_ad_1_creative_1_tracking_complete.promise;
    assert.ok(true, 'Midroll 2 Ad 1 Creative 1 tracking complete should be sent');

    // midroll 2 - 2nd ad
    ad = ad_pod!.ads[1];
    assert.is(ad.sequence, ad_pod_prepared!.ads[1].sequence, 'Ad should be the same as the one prefetched');

    adClient.notifyAdStarted(ad);
    await midroll_2_ad_2_impression_1.promise;
    assert.ok(true, 'Midroll 2 Ad 2 Impression 1 should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 0.2, ad.sequence);
    await midroll_2_ad_2_creative_1_tracking_start.promise;
    assert.ok(true, 'Midroll 2 Ad 2 Creative 1 tracking start should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 2.5, ad.sequence);
    await midroll_2_ad_2_creative_1_tracking_firstQuartile.promise;
    assert.ok(true, 'Midroll 2 Ad 2 Creative 1 tracking firstQuartile should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 5.0, ad.sequence);
    await midroll_2_ad_2_creative_1_tracking_midpoint.promise;
    assert.ok(true, 'Midroll 2 Ad 2 Creative 1 tracking midpoint should be sent');

    adClient.notifyAdCreativePlaying(ad.adCreatives[0], 7.5, ad.sequence);
    await midroll_2_ad_2_creative_1_tracking_thirdQuartile.promise;
    assert.ok(true, 'Midroll 2 Ad 2 Creative 1 tracking thirdQuartile should be sent');

    adClient.notifyAdCreativeEnded(ad.adCreatives[0], ad.sequence);
    await midroll_2_ad_2_creative_1_tracking_complete.promise;
    assert.ok(true, 'Midroll 2 Ad 2 Creative 1 tracking complete should be sent');

    if (ad_pod!.ads.length === ad.sequence) {
        adClient.notifyAdPodEnded();
    }

    assert.is(content_resume_requested_count, 2, 'Content resume should be requested');
});

test('sort ads by sequence', async () => {
    const ads: ParserAd[] = [];
    const total = 11;
    for (var i = 1; i < total; i++) {
        const sequence = total - i;
        const ad = new ParserAd(`${sequence}__id`, sequence % 2 === 1 || sequence === 6 ? void 0 : sequence);
        ads.push(ad);
    }
    const sorted = sortAdsBySequence(ads);
    assert.equal(sorted[0].sequence, void 0);
    assert.equal(sorted[1].sequence, 2);
    assert.equal(sorted[2].sequence, void 0);
    assert.equal(sorted[3].sequence, 4);
    assert.equal(sorted[4].sequence, void 0);
    assert.equal(sorted[5].sequence, void 0);
    assert.equal(sorted[6].sequence, void 0);
    assert.equal(sorted[7].sequence, 8);
    assert.equal(sorted[8].sequence, void 0);
    assert.equal(sorted[9].sequence, 10);
});

type GetFunction = (url: string) => Promise<string>;

class MockHttpClient implements IHttpClient {

    registerGetFunction(getFunction: GetFunction): void {
        this.get = getFunction;
    }

    get(url: string): Promise<string> {
        return Promise.reject('Should not be called');
    }

}

function createPromise(): { promise: Promise<void>, resolve: () => void, reject: () => void } {
    let promiseResolve: (value: void | PromiseLike<void>) => void;
    const promise = new Promise<void>((resolve) => promiseResolve = resolve);
    return {
        promise: promise,
        resolve: () => promiseResolve(),
        reject: () => {}
    };
};

function wait(): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, 10));
}

test.run();
