'use strict';

const os = require('os'),
      util = require('util');

const StatsD = require('node-statsd');

const fakeStethoskop = {
  noteValue () {}
};

const Stethoskop = function (options) {
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
  setInterval(() => {
    this.noteCpuUsage();
    this.noteMemoryUsage();
  }, seconds * 1000);
};

Stethoskop.prototype.noteCpuUsage = function () {
  const averageLoad = os.loadavg()[0],
        numberOfCpus = os.cpus().length;

  this.noteValue('$cpu.load.average', averageLoad / numberOfCpus);
};

Stethoskop.prototype.noteMemoryUsage = function () {
  const memoryUsage = process.memoryUsage();

  this.noteValue('$memory.rss', memoryUsage.rss);
  this.noteValue('$memory.heap.used', memoryUsage.heapUsed);
  this.noteValue('$memory.heap.total', memoryUsage.heapTotal);
};

Stethoskop.prototype.noteValue = function (key, value) {
  this.statsD.gauge(key, value);
};

module.exports = Stethoskop;
