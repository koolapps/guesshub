var model = require('model');
var plugins = require('./plugins');

var UserLevelProgress = plugins(model('UserLevelProgress'))
  .attr('rounds')
  .attr('guessed')
  .attr('missed')
  .attr('score_earned')   // One entry per round, 0 for misses.
  .attr('mistakes_left')  // < 0 means the level is lost.
  ;

UserLevelProgress.create = function (level) {
  return new UserLevelProgress({
    rounds: level.num_rounds(),
    guessed: 0,
    missed: 0,
    score_earned: [],
    mistakes_left: level.num_mistakes_allowed()
  });
};

UserLevelProgress.prototype.completed_round = function () {
  return this.guessed() + this.missed();
};

UserLevelProgress.prototype.recordRoundMissed = function () {
  this.missed(this.missed() + 1);
  this.mistakes_left(this.mistakes_left() - 1);
  this.score_earned().push(0);
};

UserLevelProgress.prototype.recordRoundGuessed = function (scoreEarned) {
  this.guessed(this.guessed() + 1);
  this.score_earned().push(scoreEarned);
};

UserLevelProgress.prototype.commmitScore = function () {
  return this.score_earned().reduce(function(left, right) {
    return left + right;
  });
};

UserLevelProgress.prototype.totalScore = function () {
  return this.commmitScore()
       + this.mistakes_left() * UserLevelProgress.SCORE_PER_LIFE;
};

UserLevelProgress.SCORE_PER_LIFE = 50;

module.exports = UserLevelProgress;
