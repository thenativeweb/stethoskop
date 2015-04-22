'use strict';

var assert = require('assertthat');

var Stethoskop = require('../lib/Stethoskop.js');

suite('Stethoskop', function () {
  test('is a function.', function (done) {
    assert.that(Stethoskop).is.ofType('function');
    done();
  });
});
