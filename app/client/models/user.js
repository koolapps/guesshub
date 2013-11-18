var model = require('model');
var plugins = require('./plugins');

var User = plugins(model('User'))
  .attr('score', { default: 0 })
  // TODO: Revert to empty powers once we're done debugging.
  .attr('powers', { default: {time: 5, repo: 1, commit: 1, half: 1} });

User.prototype.addScore = function (commit, secondsTaken) {
  // TODO: Finalize the score calculation formula.
  // TODO: Move score calculation to game.js.
  // Assuming grade is between 0 and 50 we rescale to 50 - 100
  var grade = commit.grade() * 2;
  this.score(
    this.score() + Math.round(grade / Math.sqrt(1 + secondsTaken))
  );
};

User.prototype.subtractScore = function (value) {
  if (this.score() < value) {
    throw Error('Not enough score to subtract.');
  }
  this.score(this.score() - value);
};

User.prototype.addPower = function (power) {
  var powers = this.powers();
  powers[power]++;
  this.powers(powers);
};

User.prototype.removePower = function (power) {
  var powers = this.powers();
  if (powers[power] <= 0) {
    throw Error('No power of type "' + power + '" to remove.');
  }
  powers[power]--;
  this.powers(powers);
};

module.exports = User;
