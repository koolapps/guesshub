var $ = require('jquery');
var audio = require('audio');
var Hogan = require('hogan.js');
var humanize = require('humanize-number');
var template = Hogan.compile(require('./template'));
var headerTemplate = Hogan.compile(require('./header-template'));
var UserLevelProgress = require('models').UserLevelProgress;

module.exports = FinishScreen;

function FinishScreen (user, $finishHeader, $finishScreen, onHub, onRetry) {
  this.user = user;
  this.$finishHeader = $finishHeader;
  this.$finishScreen = $finishScreen;
  this.onHub = onHub;
  this.onRetry = onRetry;
  this.active = false;

  // Listen to clicks.
  this.$finishScreen.on('click', '.button.to-hub', function() {
    this.onHub();
    this.active = false;
  }.bind(this));
  this.$finishScreen.on('click', '.button.retry', function() {
    this.onRetry();
    this.active = false;
  }.bind(this));
}

FinishScreen.prototype.render = function (level, commits, levelProgress) {
  this.active = true;
  var outcome = this.outcome(level.name() == 'survival', levelProgress);
  this.renderHead(outcome);
  this.renderDetails(
      outcome,
      level.num_mistakes_allowed(),
      levelProgress,
      this.commitsArg(commits, levelProgress));

  // TODO: Add a spinning animation to the icon in time with the audio.
  switch (outcome) {
    case 'Flawless':
      audio.play('flawless-victory');
      break;
    case 'Victory':
      audio.play('victory');
      break;
    case 'The End':
      audio.play('end');
      break;
    case 'Defeat':
      audio.play('defeat');
      break;
    default:
      throw Error('Unknown outcome: ' + outcome);
  }
};

FinishScreen.prototype.renderHead = function (outcome) {
  switch (outcome) {
    case 'Flawless':
      glyph = 'star';
      break;
    case 'Victory':
      glyph = 'thumbs-up';
      break;
    case 'The End':
      glyph = 'bell';
      break;
    case 'Defeat':
      glyph = 'thumbs-down';
      break;
    default:
      throw Error('Unknown outcome: ' + outcome);
  }

  // Render the template.
  var args = {outcome: outcome, glyph: glyph};
  this.$finishHeader.empty().html(headerTemplate.render(args));
};

FinishScreen.prototype.renderDetails =
    function (outcome, maxLives, progress, commits) {
  var isVictory = outcome != 'Defeat';

  // Count lives.
  var lives = [];
  for (var i = 0; i < maxLives; i++) {
    lives.push({is_left: (maxLives - i) <= progress.mistakes_left()});
  }
  var livesScore = Math.max(0, progress.mistakes_left())
                 * UserLevelProgress.SCORE_PER_LIFE;

  // Sum up the score.
  var prevScore = this.user.score() - progress.totalScore();
  var newScore = isVictory ? this.user.score() : prevScore;

  // Set up args.
  var args = {
    outcome: outcome,
    is_victory: isVictory,
    score_previous: prevScore,
    score_new: newScore,
    achievements: [],
    commits: commits,
    lives: lives,
    lives_score: livesScore
  };

  // Render the template.
  this.$finishScreen.empty().html(template.render(args));

  // Start the counting animation.
  this.showScores(outcome != 'Defeat');
};

FinishScreen.prototype.outcome = function (isSurvival, levelProgress) {
  if (levelProgress.mistakes_left() >= 0) {
    if (levelProgress.missed() == 0) {
      return 'Flawless';
    }  else {
      return 'Victory';
    }
  } else {
    if (isSurvival) {
      // Special case: the survival level has no defeat.
      return 'The End';
    } else {
      return 'Defeat';
    }
  }
};

FinishScreen.prototype.commitsArg = function (commits, levelProgress) {
  var scores = levelProgress.score_earned();
  var commitArgs = [];
  for (var i = 0; i < scores.length; i++) {
    var commit = commits[i];
    var score = scores[i];
    var json = commit.toJSON();
    json.score_earned = humanize(score);
    json.is_guessed = score > 0;
    commitArgs.push(json);
  }
  return commitArgs;
};

FinishScreen.prototype.showScores = function (animate) {
  var suffix = ' <span class="currency">G</span>';
  var step = 3;
  var delay = 50;

  var startCounting = function($el, $rest, cb) {
    var start = parseInt($el.data('from'), 10);
    var end = parseInt($el.data('to'), 10);
    var prefix = $el.data('prefix') || '';

    var countTo = function (value, end) {
      $el.html(prefix + humanize(value) + suffix);
      if (value < end) {
        setTimeout(countTo.bind(null, Math.min(value + step, end), end), delay);
      } else if ($rest.length) {
        startCounting($rest.first(), $rest.slice(1));
      } else if (cb) {
        cb();
      }
    };

    countTo(animate ? start : end, end);
  };

  var $scores = $('.score', this.$finishScreen);
  startCounting($scores.first(), $scores.slice(1, -1));  // Separate

  var done = false;
  var jingle = function(last) {
    if (done || !animate || !this.active) return;
    var rand = Math.random() < 0.5;
    var num = last == 1 ? (rand ? 2 : 3) :
              last == 2 ? (rand ? 1 : 3) :
              last == 3 ? (rand ? 2 : 1) :
              1;
    audio.play('coin-' + num, jingle.bind(null, num));
  }.bind(this);
  jingle();
  startCounting($scores.last(), $(), function() { done = true; });  // Total
};
