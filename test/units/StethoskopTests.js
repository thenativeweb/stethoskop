'use strict';

const assert = require('assertthat');

const Stethoskop = require('../../src/Stethoskop.js');

suite('Stethoskop', () => {
  test('is a function.', done => {
    assert.that(Stethoskop).is.ofType('function');
    done();
  });
});
