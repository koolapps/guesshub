var d3 = require('d3');

function Timer ($container, options) {
  if (!options.interval) {
    throw new Error('Please set an interval');
  }

  this.$container = $container;
  this.interval = options.interval;
  this.timeLeft = options.interval;
  this.progressWidth = options.progressWidth || 5;
  this.outerRadius = $container.height() / 2;
  this.innerRadius = this.outerRadius - this.progressWidth;
  this.d3Container = d3.select($container[0]);
  this.svg = this.d3Container.append('svg').style('width', $container.height())
  this._completeCallback = options.onComplete || function () {};

  this._initialDraw();
}

Timer.prototype._initialDraw = function () {
  this.group = this.svg.append('g').attr(
    'transform',
    'translate(' + this.outerRadius + ',' + this.outerRadius +')'
  );

  this.group.append('path').attr('fill', 'black');
  this._updatePath(1);

  this.group.append('circle')
    .attr('r', this.innerRadius)
    .attr('fill', 'white')
    .attr('stroke', 'grey');


  var text = this.group.append('text').text(this.timeLeft);
  text
    .attr('text-anchor', 'middle')
    // TODO(amasad): I don't think this is right?
    .attr('y', parseInt(text.style('font-size'), 10) / 2)
};

var SEC = 1000;

Timer.prototype.start = function() {
  setTimeout(function () {
    this._decrementTime();
    this._updatePath(this.timeLeft / this.interval);
  }.bind(this), SEC);
};

Timer.prototype._decrementTime = function() {
  this.timeLeft--;
  this.group.select('text').text(this.timeLeft);
  if (this.timeLeft === 0) {
    this._completeCallback();
  } else {
    this.start();
  }
};

Timer.prototype._updatePath = function (ratioLeft) {
  this.group.select('path').attr(
    'd',
    d3.svg.arc()
      .startAngle(0)
      .endAngle(2 * Math.PI * ratioLeft)
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)
  );
};


module.exports = Timer;
