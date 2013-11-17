var $ = require('jquery');
var d3 = require('d3');
var template = require('./template');

var SEC = 1000;
var PANIC_MODE_THRESHOLD = 0.25;

// TODO: Pulsate the timer and label when time remaining <25%.
// TODO: Add timer tick sounds, louder when time remaining <25%.
function Timer(interval, onComplete) {
  if (!interval) {
    throw new Error('No interval set.');
  }

  this.$el = $(template);
  this.interval = interval;
  this.timeLeft = interval;
  this._completeCallback = onComplete || $.noop;
  this._ticks = [];
  this._timeout = null;
}

Timer.prototype.start = function () {
  this._draw();
  this._timeout = setInterval(this._tick.bind(this), SEC);
};

Timer.prototype.stop = function () {
  if (this._timeout) clearTimeout(this._timeout);
};

Timer.prototype._tick = function () {
  this.timeLeft--;

  var panic = this.timeLeft / this.interval <= PANIC_MODE_THRESHOLD;
  this.$el.toggleClass('panic', panic);
  this._ticks[this.timeLeft].addClass('expired');

  if (this.timeLeft === 0) {
    this.stop();
    this._completeCallback();
  }
};

Timer.prototype._draw = function () {
  this._ticks = [];
  var width = (50 / (this.interval - 0.5)) + '%';
  for (var i = 0; i < this.interval; i++) {
    var tick = $('<div>').addClass('tick').css('width', width);
    this._ticks.push(tick);
    this.$el.append(tick);
    this.$el.append($('<div>').addClass('spacer').css('width', width));
  }
  this.$el.children().last().remove();
};

Timer.prototype.addPercentTime = function (val) {
  var bonusTime = (val / 100) * this.interval;
  this.timeLeft = Math.round(
    Math.min(this.interval, bonusTime + this.timeLeft)
  );
  this._ticks.slice(0, this.timeLeft).forEach(function ($tick) {
    $tick.removeClass('expired');
  });
};

module.exports = Timer;
