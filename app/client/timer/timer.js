var $ = require('jquery');
var d3 = require('d3');
var template = require('./template');

var SEC = 1000;
var TWOPI = 2 * Math.PI;

// TODO: Add comments to this code.
// TODO: Animate ticks.
// TODO: Pulsate the timer and label when time remaining <25%.
// TODO: Add timer tick sounds, louder when time remaining <25%.
function Timer (options) {
  if (!options.interval) {
    throw new Error('Please set an interval');
  }

  this.$el = $(template);
  this.interval = options.interval;
  this.timeLeft = options.interval;
  this.progressWidth = options.progressWidth || 5;
  this.outerRadius = options.outerRadius || this.$el.height() / 2;
  this.innerRadius = this.outerRadius - this.progressWidth;
  this.d3Container = d3.select(this.$el[0]);
  this.svg = this.d3Container.append('svg').style('width', this.outerRadius * 2);
  this._completeCallback = options.onComplete || function () {};

  this._initialDraw();
}

Timer.prototype._initialDraw = function () {
  this.group = this.svg.append('g').attr(
    'transform',
    'translate(' + this.outerRadius + ',' + this.outerRadius +')'
  );

  this.group.append('path').attr('fill', '#eee');
  this._updatePath(1);

  var arc = d3.svg.arc().innerRadius(this.innerRadius).outerRadius(this.outerRadius);
  this.group.append('text')
      .text(this.timeLeft)
      .attr('fill', '#eee')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle');
};

Timer.prototype.start = function() {
  this.timeout = setTimeout(function () {
    this._decrementTime();
    this._updatePath(this.timeLeft / this.interval);
  }.bind(this), SEC);
};

Timer.prototype.stop = function () {
  if (this.timeout) clearTimeout(this.timeout);
};

Timer.prototype._decrementTime = function() {
  this.timeLeft--;
  var text = this.group.select('text');
  text.text(this.timeLeft);
  this._colorByTime(text);
  if (this.timeLeft === 0) {
    this._completeCallback();
  } else {
    this.start();
  }
};

Timer.prototype._updatePath = function (ratioLeft) {
  var path = this.group.select('path');
  path.attr(
    'd',
    d3.svg.arc()
      .startAngle(TWOPI)
      .endAngle(TWOPI * (1 - ratioLeft))
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)
  );
  this._colorByTime(path);
};

Timer.prototype._colorByTime = function (elem) {
  if (this.timeLeft <= this.interval / 4) {
    elem.attr('fill', '#a50000');
  }
};

module.exports = Timer;
