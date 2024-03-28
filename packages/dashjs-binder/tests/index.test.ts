import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { selectAdMediaFile } from '../src/DashjsBinder';
import { AdMediaFile, Bitrate } from '@ygoto3/omap-core';


const test = suite('DashjsBinder');

test('select AdMediaFile', () => {
    const adMediaFiles = [
        [1280, 720, 200],
        [1920, 1080, 400],
        [720, 480, 100],
    ].map((params, idx) => {
        const bitrate = new Bitrate(params[2], params[2] + 50, params[2] - 50);
        return new AdMediaFile(`https://example.com/ad/${ idx }.mp4`, params[0], params[1], bitrate);
    });

    let targetBitrate: Bitrate;
    let actual: AdMediaFile;

    targetBitrate = new Bitrate(400, 500);
    actual = selectAdMediaFile(adMediaFiles, 1080, {
        bitrate: targetBitrate,
    });
    assert.equal(actual, adMediaFiles[1]);

    targetBitrate = new Bitrate(300, 500);
    actual = selectAdMediaFile(adMediaFiles, 1080, {
        bitrate: targetBitrate,
    });
    assert.equal(actual, adMediaFiles[0]);

    targetBitrate = new Bitrate(void 0, 220);
    actual = selectAdMediaFile(adMediaFiles, 1080, {
        bitrate: targetBitrate,
    });
    assert.equal(actual, adMediaFiles[2]);

    targetBitrate = new Bitrate(300);
    actual = selectAdMediaFile(adMediaFiles, NaN, {
        bitrate: targetBitrate,
    });
    assert.equal(actual, adMediaFiles[0]);

    actual = selectAdMediaFile(adMediaFiles, 901);
    assert.equal(actual, adMediaFiles[1]);
});

test.run();
