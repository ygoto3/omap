import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import mapArrayOrElem from '../src/mapArrayOrElem';

const test = suite('utils');

test('mapArrayOrElem', () => {
    let actual: any;
    let expected: any;

    expected = ['bb', 'cc'];
    actual = mapArrayOrElem(['b', 'c'], (item) => item + item);
    assert.equal(actual, expected);
});

test.run();
