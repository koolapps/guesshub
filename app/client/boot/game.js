var $ = require('jquery');

var models = require('models');
var Level = models.Level;
var UserLevelProgress = models.UserLevelProgress;
var Power = models.Power;

var scoreCard = require('score-card');
var powerList = require('power-list');
var levelStats = require('level-stats');
var levelHub = require('level-hub');
var finishScreen = require('finish-screen');
var hearts = require('hearts');

var CommitDisplay = require('commit-display');
var Timer = require('timer');
var RepoList = require('repo-list');

module.exports = Game;

function Game (options) {
  // Game state.
  this.user = options.user;
  this.campaign = options.campaign;

  // Level state.
  this.level = null;
  this.levelProgress = null;
  this.levelRounds = null;

  // Round state.
  this.round = null;
  this.startTime = null;

  // DOM references.
  this.$finishScreen = options.$finishScreen;
  this.$repos = options.$repos;
  this.$timer = options.$timer;
  this.$scoreCard = options.$scoreCard;
  this.$levelStats = options.$levelStats;
  this.$commitDisplay = options.$commitDisplay;
  this.$powerList = options.$powerList;
  this.$levelHub = options.$levelHub;
  this.$hearts = options.$hearts;

  // Widget references.
  this.commitDisplay = null;
  this.timer = null;
  this.repoList = null;
}

/**** State Control ****/

Game.prototype.start = function () {
  // TODO: Start from a tutorial skipping the hub for new users.
  this.showHub();
};

Game.prototype.clear = function () {
  this.$repos.empty().hide();
  this.$timer.empty().hide();
  this.$scoreCard.empty().hide();
  this.$levelStats.empty().hide();
  this.$commitDisplay.empty().hide();
  this.$powerList.empty().hide();
  this.$levelHub.empty().hide();
  this.$finishScreen.empty().hide();

  // TODO: Properly destroy widgets?
  this.commitDisplay = null;
  this.timer = null;
};

Game.prototype.showHub = function () {
  this.clear();

  // TODO: Add achievements UI.
  this._renderScoreCard();
  this._renderPowers('buy');
  this._renderHub();
};

Game.prototype.showLevel = function (level) {
  this.clear();

  this.level = level;
  // TODO: Show loading bar.
  level.fetchRounds(function(rounds) {
    this.levelRounds = rounds;
    this.levelProgress = UserLevelProgress.create(level, this.user);

    this._renderScoreCard();
    this._renderPowers('use');
    this._renderLevelStats();
    this._renderHearts();

    this.startRound();
  }.bind(this));
};

Game.prototype.showFinishScreen = function () {
  this.clear();

  this._renderScoreCard();
  this._renderLevelStats();
  this._renderHearts();
  this._renderPowers('inactive');
  this._renderFinishScreen();
};

Game.prototype.startRound = function () {
  this.round = this.levelRounds[this.levelProgress.completed_round()];
  this._renderTimer(this.round.timer())
  this._renderRepos(this.round.repos())
  this._renderCommitDisplay(this.round.commit());
  this.timer.start();
  this.startTime = Date.now();

  console.log('ANSWER:', this.round.commit().repository());
};

/**** Event Handling ****/

Game.prototype._onGuess = function (repo) {
  this._finishRound(repo.name() === this.round.commit().repository());
};

Game.prototype._onPower = function (mode, power) {
  switch (mode) {
    case 'buy':
      this.user.addPower(power);
      this.user.subtractScore(power.price());
      break;
    case 'use':
      // TODO: Maybe move these into Power.use()?
      switch (power.id()) {
        case 'time':
          this.timer.addPercentTime(25);
          break;
        case 'commit':
          this.commitDisplay.setVisibility({ metadata: true });
          break;
        case 'repo':
          alert('TODO: Use repo power.');
          break;
        case 'half':
          var hidden = 0;
          var correctRepoName = this.round.commit().repository();
          this.repoList.hideRepos(
            this.round.repos().sort(function () {
              return 0.5 - Math.random();
            }).filter(function (repo) {
              if (hidden < 2 && repo.name() != correctRepoName) {
                hidden++;
                return repo;
              }
            }));
          break;
        default:
          throw new Error('Unexpected power: ' + power.id());
      }
      this.user.removePower(power);
      break;
    case 'inactive':
      // No interaction possible.
      break;
    default:
      throw Error('Invalid mode: ' + mode);
  }
};

Game.prototype._finishRound = function (won) {
  this.timer.stop();
  var progress = this.levelProgress;
  // TODO: Add sound effects on win/loss.
  progress.completed_round(progress.completed_round() + 1);
  if (won) {
    // TODO: Finalize the score calculation formula.
    // Assuming grade is between 0 and 50 we rescale to 50 - 100.
    var grade = 50 + this.round.commit().grade();
    var secondsTaken = Math.floor((Date.now() - this.startTime) /  1000);
    var pointsEarned = Math.round(grade / Math.sqrt(1 + secondsTaken));
    // TODO: Don't add score to the user until the level is done.
    this.user.addScore(pointsEarned);
    progress.guessed(progress.guessed() + 1);
    progress.score_earned(progress.score_earned() + pointsEarned);
  } else {
    progress.mistakes_left(progress.mistakes_left() - 1);
    progress.missed(progress.missed() + 1);
  }
  if (progress.mistakes_left() < 0) {
    this.showFinishScreen();
  } else if (progress.completed_round() === progress.rounds()) {
    this.user.completeLevel(this.level);
    this.showFinishScreen();
  } else {
    this.startRound();
  }
};

/**** Rendering ****/

Game.prototype._renderLevelStats = function () {
  this.$levelStats.empty().append(levelStats(this.levelProgress));
  this.$levelStats.show();
};

Game.prototype._renderTimer = function (seconds) {
  this.timer = new Timer({
    interval: seconds,
    outerRadius: this.$timer.outerHeight() / 2,
    progressWidth: 10,
    onComplete: this._finishRound.bind(this, false)
  });
  this.$timer.empty().append(this.timer.$el);
  this.$timer.show();
};

Game.prototype._renderRepos = function (repos) {
  this.repoList = new RepoList(repos, this._onGuess.bind(this));
  this.$repos.empty().append(this.repoList.$el);
  this.$repos.show();
};

Game.prototype._renderCommitDisplay = function (commit) {
  this.commitDisplay = new CommitDisplay(commit);
  this.$commitDisplay.empty().append(this.commitDisplay.$el);
  this.$commitDisplay.show();
};

Game.prototype._renderScoreCard = function() {
  this.$scoreCard.append(scoreCard(this.user));
  this.$scoreCard.show();
};

Game.prototype._renderPowers = function(mode) {
  var callback = this._onPower.bind(this, mode);
  this.$powerList.append(powerList(Power.ALL, this.user, mode, callback));
  this.$powerList.show();
};

Game.prototype._renderHub = function() {
  this.$levelHub.append(levelHub(this.campaign, this.user, this.showLevel.bind(this)));
  this.$levelHub.show();
};

Game.prototype._renderFinishScreen = function() {
  this.$finishScreen.append(
      finishScreen(this.user,
                   this.level,
                   this.levelRounds.map(function(r) { return r.commit(); }),
                   this.levelProgress,
                   this.showHub.bind(this),
                   this.showLevel.bind(this, this.level)));
  this.$finishScreen.show();
};

Game.prototype._renderHearts = function () {
  this.$hearts.empty().append(hearts(this.levelProgress));
  this.$hearts.show();
};
