import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import filterNull from '../src/filterNull';

const test = suite('utils');

test('filterNull', () => {
    let actual: any;
    let expected: any;
    
    expected = false;
    actual = filterNull(null);
    assert.is(actual, expected);

    expected = true;
    actual = filterNull(1);
    assert.is(actual, expected);

    expected = true;
    actual = filterNull('str');
    assert.is(actual, expected);

    expected = true;
    actual = filterNull({});
    assert.is(actual, expected);
});

test.run();