'use strict';

var os = require('os'),
    util = require('util');

var StatsD = require('node-statsd');

var Stethoskop = function (options) {
  this.statsD = new StatsD({
    host: options.to.host || 'localhost',
    port: options.to.port || 8125,
    prefix: util.format('%s.%s.%s.', options.from.application, options.from.component, os.hostname())
  });

  this.watchSystemUsage();
};

Stethoskop.prototype.watchSystemUsage = function (seconds) {
  var that = this;

  setInterval(function () {
    that.noteCpuUsage();
    that.noteMemoryUsage();
  }, seconds * 1000);
};

Stethoskop.prototype.noteCpuUsage = function () {
  var load = os.loadavg();

  this.noteValue('$cpu.load.average', load[0]);
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
