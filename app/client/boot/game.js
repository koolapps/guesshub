var $ = require('jquery');
var Timer = require('timer');
var Level = require('models').Level
var repoList = require('repo-list');
var levelMeter = require('level-meter');
var CommitDisplay = require('commit-display');
var UserLevelProgress = require('models').UserLevelProgress;

var ROUNDS_PER_LEVEL = 10;

module.exports = Game;

function Game (options) {
  this.$repos = options.$repos;
  this.$timer = options.$timer;
  this.$levelMeter = options.$levelMeter;
  this.$commitDisplay = options.$commitDisplay;
}

Game.prototype.start = function () {
  this.startLevel(0);
};

//              /-fst-fst-bns-fst-fst-\
// reg-reg-reg-|                       |-final-survival
//              \-hrd-hrd-bns-hrd-hrd-/

var LEVELS_PATH = [
  [ 'regular' ],
  [ 'regular' ],
  [ 'regular' ],
  [ 'fast', 'hard' ],
  [ 'fast', 'hard' ],
  [ 'bonus' ],
  [ 'fast', 'hard' ],
  [ 'fast', 'hard' ],
  [ 'final' ],
  [ 'survival' ],
];
var LEVEL_TYPES = ['regular', 'fast', 'hard', 'bonus', 'final', 'survival'];

Game.prototype.startLevel = function (level) {
  console.log('Game DEBUG: starting level %d', level);

  var types = LEVELS_PATH[level];
  var type;
  if (types.length === 1) {
    type = types[0];
  } else {
    while (type == null) {
      type = window.prompt('Choose type from: ' + types.join(', ')).trim();
      if (LEVEL_TYPES.indexOf(type) === -1) type = null;
    }
  }

  Level.getLevel({
    type: type,
    level_no: level
  }, function (level) {
    this.level = level;
    this.levelProgress = new UserLevelProgress();
    this.levelProgress.rounds(this.level.rounds().length);
    this._renderLevelMeter();
    this.startRound();
  }.bind(this));
};

Game.prototype._onGuess = function (repo) {
  this._finishRound(repo.name() === this.round.commit().repository());
};

Game.prototype._finishRound = function (won) {
  this.timer.stop();
  var progress = this.levelProgress;
  // TODO: Add sound effects on win/loss.
  progress.completed_round(progress.completed_round() + 1);
  if (won) {
    progress.guessed(progress.guessed() + 1);
  } else {
    progress.missed(progress.missed() + 1);
  }
  if (progress.completed_round() === progress.rounds()) {
    this.startLevel(this.level.level_no() + 1);
  } else {
    this.startRound();
  }
};

Game.prototype._renderLevelMeter = function () {
  this.$levelMeter.empty().append(levelMeter(this.levelProgress));
};

Game.prototype._renderTimer = function (commit) {
  this.timer = new Timer({
    interval: this.level.timer(commit.grade())
  , outerRadius: this.$timer.height() / 2
  , progressWidth: 8
  , onComplete: this._finishRound.bind(this, false)
  });
  this.$timer.empty().append(this.timer.$el);
  return this;
};

Game.prototype._renderRepos = function (repos) {
  this.$repos.empty().append(
    repoList(repos, this._onGuess.bind(this))
  );
  return this;
};

Game.prototype._renderCommitDisplay = function (commit) {
  this.commitDisplay = new CommitDisplay(commit);
  this.$commitDisplay.empty().append(this.commitDisplay.$el);
  return this;
};

Game.prototype.startRound = function () {
  this.round = this.level.rounds()[this.levelProgress.completed_round()];
  this
    ._renderTimer(this.round.commit())
    ._renderRepos(this.round.repos())
    ._renderCommitDisplay(this.round.commit());
  this.timer.start();
  
  console.log('psst', this.round.commit().repository());
};
