import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import eraseNaN from '../src/eraseNaN';

const test = suite('utils/eraseNaN');

test("eraseNaN", () => {
    assert.is(eraseNaN(NaN), void 0);
    assert.is(eraseNaN(0), 0);
    assert.is(eraseNaN(-1), -1);
    assert.is(eraseNaN(1), 1);
});

test.run();
