var model = require('model');
var plugins = require('./plugins');

// TODO: Rename file to user-level-progress.js for consistency.
var UserLevelProgress = plugins(model('UserLevelProgress'))
  .attr('rounds')
  .attr('guessed')
  .attr('missed')
  .attr('score_earned')
  .attr('mistakes_left')  // < 0 means the level is lost.
  ;

UserLevelProgress.create = function (level) {
  return new UserLevelProgress({
    rounds: level.num_rounds(),
    guessed: 0,
    missed: 0,
    score_earned: 0,
    mistakes_left: level.num_mistakes_allowed()
  });
};

UserLevelProgress.prototype.completed_round = function () {
  return this.guessed() + this.missed();
};

module.exports = UserLevelProgress;
