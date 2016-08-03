'use strict';

const os = require('os'),
      util = require('util');

const StatsD = require('node-statsd');

const fakeStethoskop = {
  noteValue () {}
};

let lastCpuCheck,
    lastCpuUsage;

const resetCpuCheck = function () {
  lastCpuCheck = process.hrtime();
  lastCpuUsage = process.cpuUsage();
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

  resetCpuCheck();

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
        cpuUsage = process.cpuUsage(lastCpuUsage),
        interval = process.hrtime(lastCpuCheck) / 1000;

  resetCpuCheck();

  this.noteValue('$cpu.checkInterval', interval);
  this.noteValue('$cpu.load.average', averageLoad / os.cpus().length);
  this.noteValue('$cpu.usage.system', cpuUsage.system / interval);
  this.noteValue('$cpu.usage.user', cpuUsage.user / interval);
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
