'use strict';

var os = require('os'),
    util = require('util');

var StatsD = require('node-statsd');

var fakeStethoskop = {
  noteValue: function () {}
};

var Stethoskop = function (options) {
  if (!options.enabled) {
    return fakeStethoskop;
  }

  this.statsD = new StatsD({
    host: options.to.host || 'localhost',
    port: options.to.port || 8125,
    prefix: util.format('%s.%s.', options.from.application, os.hostname())
  });

  this.watchSystemUsage(60);
};

Stethoskop.prototype.watchSystemUsage = function (seconds) {
  var that = this;

  setInterval(function () {
    that.noteCpuUsage();
    that.noteMemoryUsage();
  }, seconds * 1000);
};

Stethoskop.prototype.noteCpuUsage = function () {
  var averageLoad = os.loadavg()[0],
      numberOfCpus = os.cpus().length;

  this.noteValue('$cpu.load.average', averageLoad / numberOfCpus);
};

Stethoskop.prototype.noteMemoryUsage = function () {
  var memoryUsage = process.memoryUsage();

  this.noteValue('$memory.rss', memoryUsage.rss);
  this.noteValue('$memory.heap.used', memoryUsage.heapUsed);
  this.noteValue('$memory.heap.total', memoryUsage.heapTotal);
};

Stethoskop.prototype.noteValue = function (key, value) {
  this.statsD.gauge(key, value);
};

module.exports = Stethoskop;
