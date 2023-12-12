import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import forceArray from '../src/forceArray';

const test = suite('utils');

test('filterNull', () => {
    let actual: any;
    let expected: any;
    
    expected = ['a'];
    actual = forceArray('a');
    assert.equal(actual, expected);

    expected = ['b'];
    actual = forceArray(['b']);
    assert.equal(actual, expected);

    expected = [1, 2, 3];
    actual = forceArray([1, 2, 3]);
    assert.equal(actual, expected);
});

test.run();