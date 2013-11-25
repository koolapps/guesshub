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

  // Listen to clicks.
  this.$finishScreen.on('click', '.button.to-hub', this.onHub);
  this.$finishScreen.on('click', '.button.retry', this.onRetry);
}

FinishScreen.prototype.render = function (level, commits, levelProgress) {
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
    score_previous: humanize(prevScore),
    score_new: humanize(newScore),
    achievements: [],
    commits: commits,
    lives: lives,
    lives_score: livesScore
  };

  // Render the template.
  this.$finishScreen.empty().html(template.render(args));
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
