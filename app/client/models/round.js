var $ = require('jquery');
var model = require('model');
var Repo = require('./repo');
var Commit = require('./commit');
var plugins = require('./plugins');

// Immutable round descriptions, fetched from the server by Level.fetchRounds().
var Round = plugins(model('Round'))
  .attr('commit')
  .attr('repos')
  .attr('constant_timer');

Round.prototype.timer = function () {
  if (this.constant_timer()) {
    return this.constant_timer();
  } else {
    // Based on grade.
    return parseInt(5 + this.commit().grade() / 2);
  }
};

module.exports = Round;
