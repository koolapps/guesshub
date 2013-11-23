var $ = require('jquery');

var models = require('models');
var Level = models.Level;
var UserLevelProgress = models.UserLevelProgress;
var Power = models.Power;

var audio = require('audio');
var scoreCard = require('score-card');
var powerList = require('power-list');
var levelStats = require('level-stats');
var levelHub = require('level-hub');
var hearts = require('hearts');

var CommitDisplay = require('commit-display');
var Timer = require('timer');
var RepoList = require('repo-list');
var FinishScreen = require('finish-screen');

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
  this.$finishHeader = options.$finishHeader;
  this.$repos = options.$repos;
  this.$timer = options.$timer;
  this.$scoreCard = options.$scoreCard;
  this.$levelStats = options.$levelStats;
  this.$commitDisplay = options.$commitDisplay;
  this.$powerList = options.$powerList;
  this.$levelHub = options.$levelHub;
  this.$hearts = options.$hearts;
  this.$logo = options.$logo;

  // Widget references.
  this.commitDisplay = null;
  this.timer = null;
  this.repoList = null;
  this.finishScreen = new FinishScreen(
      this.user,
      this.$finishHeader,
      this.$finishScreen,
      this.showHub.bind(this),
      function() { this.showLevel(this.level); }.bind(this));
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
  this.$finishHeader.empty().hide();
  this.$hearts.empty().hide();

  this.$logo.hide();

  // TODO: Properly destroy widgets?
  this.commitDisplay = null;
  this.timer = null;
};

Game.prototype.showHub = function () {
  this.clear();
  this.$logo.show();

  // TODO: Add achievements UI.
  this._renderScoreCard(this.user.score());
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

    this._renderScoreCard(0);
    this._renderPowers('use');
    this._renderLevelStats();
    this._renderHearts();

    this.startRound();
  }.bind(this));
};

Game.prototype.showFinishScreen = function () {
  this.clear();

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
      this._renderScoreCard(this.user.score());
      break;
    case 'use':
      audio.play('power-' + power.id());
      // TODO: Maybe move these into Power.use()?
      switch (power.id()) {
        case 'time':
          this.timer.rewind(0.25);
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
          // TODO: Fix the power sometimes not working a second time
          //       (trying to hide a previously hidden repo).
          this.repoList.hideRepos(
            this.round.repos().slice().sort(function () {
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

  // Record round win.
  if (won) {
    // Assuming grade is between 0 and 50 we rescale to 50 - 100.
    var grade = 50 + this.round.commit().grade();
    var secondsTaken = Math.floor((Date.now() - this.startTime) /  1000);
    var pointsEarned = Math.round(grade / Math.sqrt(1 + secondsTaken));
    progress.recordRoundGuessed(pointsEarned);
    this._renderScoreCard(progress.commmitScore());
  } else {
    progress.recordRoundMissed();
  }

  // Find out the final outcome.
  var wonLevel = progress.completed_round() === progress.rounds();
  var lostLevel = progress.mistakes_left() < 0;

  // Play audio, making sure not to overlap the level-end effect.
  if (won && !wonLevel) {
    audio.play('guess');
  } else if (!won && !lostLevel) {
    audio.play('miss');
  }

  if (lostLevel) {
    this.showFinishScreen();
  } else if (wonLevel) {
    this.user.addScore(progress.totalScore());
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
  // Sometimes we end up replacing the timer before calling stop on it.
  // For now, stop it manually here just in case.
  // TODO: Find and fix the race condition that causes this in the first place.
  this.timer && this.timer.stop();
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

Game.prototype._renderScoreCard = function(score) {
  this.$scoreCard.empty().append(scoreCard(score));
  this.$scoreCard.show();
};

Game.prototype._renderPowers = function(mode) {
  var callback = this._onPower.bind(this, mode);
  this.$powerList.append(powerList(Power.ALL, this.user, mode, callback));
  this.$powerList.show();
};

Game.prototype._renderHub = function() {
  this.$levelHub.append(
      levelHub(this.campaign, this.user, this.showLevel.bind(this)));
  this.$levelHub.show();
};

Game.prototype._renderFinishScreen = function() {
  var rounds = this.levelRounds.map(function(r) { return r.commit(); });
  this.finishScreen.render(this.level, rounds, this.levelProgress);
  this.$finishScreen.show();
  this.$finishHeader.show();
};

Game.prototype._renderHearts = function () {
  this.$hearts.empty().append(hearts(this.levelProgress));
  this.$hearts.show();
};
