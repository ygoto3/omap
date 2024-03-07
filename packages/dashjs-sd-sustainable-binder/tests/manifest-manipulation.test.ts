import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { periodSplitInfo, shortenPeriodAt } from '../src/manifest-manipulation';
import testPeriodAdaptationSetContentType from './test-period-adaptationset-contenttype';
import testPeriodAdaptationSetMimeType from './test-period-adaptationset-mimetype';

const test = suite('manifest manipulation test');

test("periodSplitInfo a period containing AdaptationSet's contentType", () => {
    const psi = periodSplitInfo(testPeriodAdaptationSetContentType, [5, 10, 30]);
    
    assert.is(psi.duration, 19.498666666666665);
    assert.is(psi.points.length, 2);

    assert.is(psi.points[0].video?.index, 0);
    assert.is(psi.points[0].video?.offsetInSecond, 5);
    assert.is(psi.points[0].video?.repeat, 0);
    assert.is(psi.points[0].video?.type, 'SegmentTimeline');

    assert.is(psi.points[0].audio?.index, 0);
    assert.is(psi.points[0].audio?.offsetInSecond, 5);
    assert.is(psi.points[0].audio?.repeat, 0);
    assert.is(psi.points[0].audio?.type, 'SegmentTimeline');

    assert.is(psi.points[1].video?.index, 0);
    assert.is(psi.points[1].video?.offsetInSecond, 10);
    assert.is(psi.points[1].video?.repeat, 1);
    assert.is(psi.points[1].video?.type, 'SegmentTimeline');

    assert.is(psi.points[1].audio?.index, 1);
    assert.is(psi.points[1].audio?.offsetInSecond, 10);
    assert.is(psi.points[1].audio?.repeat, 0);
    assert.is(psi.points[1].audio?.type, 'SegmentTimeline');

    const shortenedPeriod = shortenPeriodAt(testPeriodAdaptationSetContentType, psi.points[0]);

    // video
    let SegmentTimeline = shortenedPeriod.AdaptationSet_asArray[0].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0];
    assert.is(SegmentTimeline.S_asArray.length, psi.points[0].video!.index + 1);
    assert.is(SegmentTimeline.S_asArray[0].t, testPeriodAdaptationSetContentType.AdaptationSet_asArray[0].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0].S_asArray[0].t);
    assert.is(SegmentTimeline.S_asArray[0].d, testPeriodAdaptationSetContentType.AdaptationSet_asArray[0].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0].S_asArray[0].d);
    assert.is(SegmentTimeline.S_asArray[0].r || 0, psi.points[0].video!.repeat);

    // audio
    SegmentTimeline = shortenedPeriod.AdaptationSet_asArray[1].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0];
    assert.is(SegmentTimeline.S_asArray.length, psi.points[0].audio!.index + 1);
    assert.is(SegmentTimeline.S_asArray[0].t, testPeriodAdaptationSetContentType.AdaptationSet_asArray[1].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0].S_asArray[0].t);
    assert.is(SegmentTimeline.S_asArray[0].d, testPeriodAdaptationSetContentType.AdaptationSet_asArray[1].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0].S_asArray[0].d);
    assert.is(SegmentTimeline.S_asArray[0].r || 0, psi.points[0].audio!.repeat);
});

test("periodSplitInfo a period containing AdaptationSet's contentType", () => {
    const psi = periodSplitInfo(testPeriodAdaptationSetMimeType, [5, 10, 30]);
    
    assert.is(psi.duration, 19.498666666666665);
    assert.is(psi.points.length, 2);

    assert.is(psi.points[0].video?.index, 0);
    assert.is(psi.points[0].video?.offsetInSecond, 5);
    assert.is(psi.points[0].video?.repeat, 0);
    assert.is(psi.points[0].video?.type, 'SegmentTimeline');

    assert.is(psi.points[0].audio?.index, 0);
    assert.is(psi.points[0].audio?.offsetInSecond, 5);
    assert.is(psi.points[0].audio?.repeat, 0);
    assert.is(psi.points[0].audio?.type, 'SegmentTimeline');

    assert.is(psi.points[1].video?.index, 0);
    assert.is(psi.points[1].video?.offsetInSecond, 10);
    assert.is(psi.points[1].video?.repeat, 1);
    assert.is(psi.points[1].video?.type, 'SegmentTimeline');

    assert.is(psi.points[1].audio?.index, 1);
    assert.is(psi.points[1].audio?.offsetInSecond, 10);
    assert.is(psi.points[1].audio?.repeat, 0);
    assert.is(psi.points[1].audio?.type, 'SegmentTimeline');

    const shortenedPeriod = shortenPeriodAt(testPeriodAdaptationSetContentType, psi.points[0]);

    // video
    let SegmentTimeline = shortenedPeriod.AdaptationSet_asArray[0].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0];
    assert.is(SegmentTimeline.S_asArray.length, psi.points[0].video!.index + 1);
    assert.is(SegmentTimeline.S_asArray[0].t, testPeriodAdaptationSetMimeType.AdaptationSet_asArray[0].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0].S_asArray[0].t);
    assert.is(SegmentTimeline.S_asArray[0].d, testPeriodAdaptationSetMimeType.AdaptationSet_asArray[0].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0].S_asArray[0].d);
    assert.is(SegmentTimeline.S_asArray[0].r || 0, psi.points[0].video!.repeat);

    // audio
    SegmentTimeline = shortenedPeriod.AdaptationSet_asArray[1].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0];
    assert.is(SegmentTimeline.S_asArray.length, psi.points[0].audio!.index + 1);
    assert.is(SegmentTimeline.S_asArray[0].t, testPeriodAdaptationSetMimeType.AdaptationSet_asArray[1].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0].S_asArray[0].t);
    assert.is(SegmentTimeline.S_asArray[0].d, testPeriodAdaptationSetMimeType.AdaptationSet_asArray[1].Representation_asArray[0].SegmentTemplate_asArray[0].SegmentTimeline_asArray[0].S_asArray[0].d);
    assert.is(SegmentTimeline.S_asArray[0].r || 0, psi.points[0].audio!.repeat);
});

test.run();
