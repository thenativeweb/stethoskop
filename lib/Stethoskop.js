'use strict';

const os = require('os'),
      util = require('util');

const StatsD = require('node-statsd');

const fakeStethoskop = {
  noteValue () {}
};

const intervalInSeconds = 60;
let lastCpuUsage;

const Stethoskop = function (options) {
  if (!options.enabled) {
    return fakeStethoskop;
  }

  this.statsD = new StatsD({
    host: options.to.host || 'localhost',
    port: options.to.port || 8125,
    prefix: util.format('%s.%s.', options.from.application, os.hostname())
  });

  this.watchSystemUsage();
};

Stethoskop.prototype.watchSystemUsage = function () {
  setInterval(() => {
    this.noteCpuUsage();
    this.noteMemoryUsage();
  }, intervalInSeconds * 1000);
};

Stethoskop.prototype.noteCpuUsage = function () {
  const averageLoad = os.loadavg()[0],
        cpuUsage = process.cpuUsage(lastCpuUsage);

  this.noteValue('$cpu.load.average', averageLoad / os.cpus().length);
  this.noteValue('$cpu.usage.system', cpuUsage.system / (intervalInSeconds * 1000 * 1000));
  this.noteValue('$cpu.usage.user', cpuUsage.user / (intervalInSeconds * 1000 * 1000));
  lastCpuUsage = cpuUsage;
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
