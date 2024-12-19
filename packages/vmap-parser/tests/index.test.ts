import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import VMAPParser from '../src/VMAPParser';
import * as ENV from './setup/env';

const test = suite('VMAPParser');

test.before(ENV.setup);

test('parse normal VMAP', () => {
    let vmap: string;
    let parser: VMAPParser;

    vmap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
            <vmap:AdBreak timeOffset="start" breakType="linear" breakId="preroll">
                <vmap:AdSource id="preroll-ad-1" allowMultipleAds="false" followRedirects="true">
                    <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/preroll-ad-1]]></vmap:AdTagURI>
                </vmap:AdSource>
            </vmap:AdBreak>
            <vmap:AdBreak timeOffset="00:00:15.000" breakType="linear" breakId="midroll-1">
                <vmap:AdSource id="midroll-1-ad-1" allowMultipleAds="false" followRedirects="true">
                    <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/midroll-1-ad-1]]></vmap:AdTagURI>
                </vmap:AdSource>
            </vmap:AdBreak>
            <vmap:AdBreak timeOffset="00:00:15.000" breakType="linear" breakId="midroll-1">
                <vmap:AdSource id="midroll-1-ad-2" allowMultipleAds="false" followRedirects="true">
                    <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/midroll-1-ad-2]]></vmap:AdTagURI>
                </vmap:AdSource>
            </vmap:AdBreak>
            <vmap:AdBreak timeOffset="00:00:15.000" breakType="linear" breakId="midroll-1">
                <vmap:AdSource id="midroll-1-ad-3" allowMultipleAds="false" followRedirects="true">
                    <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/midroll-1-ad-3]]></vmap:AdTagURI>
                </vmap:AdSource>
            </vmap:AdBreak>
            <vmap:AdBreak timeOffset="end" breakType="linear" breakId="postroll">
                <vmap:AdSource id="postroll-ad-1" allowMultipleAds="false" followRedirects="true">
                    <vmap:AdTagURI templateType="vast3"><![CDATA[https://example.com/vast/postroll-ad-1]]></vmap:AdTagURI>
                </vmap:AdSource>
            </vmap:AdBreak>
        </vmap:VMAP>
    `;
    parser = new VMAPParser(vmap);
    const parsedVMAP = parser.parse();
    if (parsedVMAP === null) {
        assert.unreachable();
        return;
    }

    assert.is(parsedVMAP.adBreaks.length, 5);

    assert.is(parsedVMAP.adBreaks[0].timeOffset, 'start');
    assert.is(parsedVMAP.adBreaks[0].adSources.length, 1);
    assert.is(parsedVMAP.adBreaks[0].adSources[0].adTagURI.templateType, 'vast3');
    assert.is(parsedVMAP.adBreaks[0].adSources[0].adTagURI.uri, 'https://example.com/vast/preroll-ad-1');

    assert.is(parsedVMAP.adBreaks[1].timeOffset, '00:00:15.000');
    assert.is(parsedVMAP.adBreaks[1].adSources.length, 1);
    assert.is(parsedVMAP.adBreaks[1].adSources[0].adTagURI.templateType, 'vast3');
    assert.is(parsedVMAP.adBreaks[1].adSources[0].adTagURI.uri, 'https://example.com/vast/midroll-1-ad-1');

    assert.is(parsedVMAP.adBreaks[2].timeOffset, '00:00:15.000');
    assert.is(parsedVMAP.adBreaks[2].adSources.length, 1);
    assert.is(parsedVMAP.adBreaks[2].adSources[0].adTagURI.templateType, 'vast3');
    assert.is(parsedVMAP.adBreaks[2].adSources[0].adTagURI.uri, 'https://example.com/vast/midroll-1-ad-2');

    assert.is(parsedVMAP.adBreaks[3].timeOffset, '00:00:15.000');
    assert.is(parsedVMAP.adBreaks[3].adSources.length, 1);
    assert.is(parsedVMAP.adBreaks[3].adSources[0].adTagURI.templateType, 'vast3');
    assert.is(parsedVMAP.adBreaks[3].adSources[0].adTagURI.uri, 'https://example.com/vast/midroll-1-ad-3');

    assert.is(parsedVMAP.adBreaks[4].timeOffset, 'end');
    assert.is(parsedVMAP.adBreaks[4].adSources.length, 1);
    assert.is(parsedVMAP.adBreaks[4].adSources[0].adTagURI.templateType, 'vast3');
    assert.is(parsedVMAP.adBreaks[4].adSources[0].adTagURI.uri, 'https://example.com/vast/postroll-ad-1');
});

test('parse no AdBreak VMAP', () => {
    let vmap: string;
    let parser: VMAPParser;

    vmap = `
        <?xml version="1.0" encoding="UTF-8"?>
            <vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
        </vmap:VMAP>
    `;
    parser = new VMAPParser(vmap);
    const parsedVMAP = parser.parse();
    if (parsedVMAP === null) {
        assert.unreachable();
        return;
    }

    assert.is(parsedVMAP.adBreaks.length, 0);
});

test.run();
