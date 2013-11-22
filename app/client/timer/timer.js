var $ = require('jquery');
var d3 = require('d3');
var audio = require('audio');
var template = require('./template');

STROKE_WIDTH = 3

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
  this.svg = this.d3Container.append('svg')
      .style('width', (this.outerRadius + STROKE_WIDTH) * 2);
  this._completeCallback = options.onComplete || function () {};

  this._initialDraw();
}

Timer.prototype._initialDraw = function () {
  var offset = this.outerRadius + STROKE_WIDTH;
  this.group = this.svg.append('g').attr(
    'transform',
    'translate(' + offset + ',' + offset +')'
  );

  this.group.append('path');
  this._updatePath(1);

  this.group.append('circle')
    .attr('r', this.innerRadius);

  this.group.append('text')
    .text(this.timeLeft)
    .attr('y', '15px');
};

var SEC = 1000;

Timer.prototype.start = function() {
  this.timeout = setTimeout(function () {
    this._decrementTime();
    this._update();
    if (this.timeLeft > 0) {
      if (this.$el.is('.panic')) {
        audio.play('timer-beep');
      } else {
        audio.play('timer-tick');
      }
    }
  }.bind(this), SEC);
};

Timer.prototype.stop = function () {
  if (this.timeout) clearTimeout(this.timeout);
};

Timer.prototype._update = function() {
  this.$el.toggleClass('panic', this.timeLeft <= this.interval * 0.25);
  this.group.select('text').text(this.timeLeft);
  this._updatePath(this.timeLeft / this.interval);
};

Timer.prototype._decrementTime = function() {
  this.timeLeft--;
  if (this.timeLeft === 0) {
    this._completeCallback();
  } else {
    this.start();
  }
};

var TWOPI = 2 * Math.PI;

Timer.prototype._updatePath = function (ratioLeft) {
  this.group.select('path').attr(
    'd',
    d3.svg.arc()
      .startAngle(TWOPI)
      .endAngle(TWOPI - (ratioLeft * TWOPI))
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)
  );
};

Timer.prototype.rewind = function (fraction) {
  this.stop();

  var bonusTime = fraction * this.interval;
  this.timeLeft = Math.round(
    Math.min(this.interval, this.timeLeft + bonusTime)
  );

  this._update();
  this.start();
};

module.exports = Timer;
