var model = require('model');
var plugins = require('./plugins');

// TODO: Revert to empty powers and 0 score once we're done debugging.
var User = plugins(model('User'))
  .attr('score', { default: 50000 })
  .attr('powers', { default: {time: 5, repo: 5, commit: 5, half: 1} })
  .attr('completed_level_ids', { default: [1,2,3,8,9] })
  ;

User.MAX_POWERS = 5;

User.prototype.addScore = function (points) {
  this.score(this.score() + points);
};

User.prototype.subtractScore = function (value) {
  if (this.score() < value) {
    throw Error('Not enough score to subtract.');
  }
  this.score(this.score() - value);
};

User.prototype.addPower = function (power) {
  var powers = this.powers();
  if (!this.canStorePower(power)) {
    throw Error('No space for power "' + power.id() + '".');
  }
  powers[power.id()]++;
  this.powers(powers);
};

User.prototype.removePower = function (power) {
  var powers = this.powers();
  if (powers[power.id()] <= 0) {
    throw Error('No power "' + power.id() + '" to remove.');
  }
  powers[power.id()]--;
  this.powers(powers);
};

User.prototype.powerCount = function (power) {
  return this.powers()[power.id()];
};

User.prototype.canStorePower = function (power) {
  return this.powerCount(power) < User.MAX_POWERS;
};

User.prototype.canAffordPower = function (power) {
  return this.score() >= power.price();
};

User.prototype.canUsePower = function (power) {
  return this.powerCount(power) > 0;
};

User.prototype.completeLevel = function (level) {
  if (this.completed_level_ids().indexOf(level.id()) === -1) {
    this.completed_level_ids().push(level.id());
  }
};

User.prototype.isLevelComplete = function (level) {
  return this.completed_level_ids().indexOf(level.id()) !== -1;
};

module.exports = User;
