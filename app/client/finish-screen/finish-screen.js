var $ = require('jquery');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

module.exports = FinishScreen;

function FinishScreen (user, $finishIcon, $finishScreen, onHub, onRetry) {
  this.user = user;
  this.$finishIcon = $finishIcon;
  this.$finishScreen = $finishScreen;
  this.onHub = onHub;
  this.onRetry = onRetry;
}

FinishScreen.prototype.render = function (level, commits, levelProgress) {
  var outcome = this.outcome(level.name() == 'survival', levelProgress);
  this.renderIcon(outcome);
  this.renderDetails(
      outcome,
      levelProgress.score_earned(),
      this.commitsArg(commits, levelProgress));
};

FinishScreen.prototype.renderIcon = function (outcome) {
  var glyph;
  switch (outcome) {
    case 'Flawless Victory':
      glyph = 'fa-star';
      break;
    case 'Victory':
      glyph = 'fa-thumbs-up';
      break;
    case 'The End':
      glyph = 'fa-bell';
      break;
    case 'Defeat':
      glyph = 'fa-thumbs-down';
      break;
    default:
      throw Error('Unknown outcome: ' + outcome);
  }

  this.$finishIcon.empty().append($('<i/>', { class: 'fa ' + glyph }));
};

FinishScreen.prototype.renderDetails =
    function (outcome, scoreEarned, commits) {
  // Set up args.
  var args = {
    outcome: outcome,
    is_defeat: outcome == 'Defeat',
    is_victory: outcome != 'Defeat',
    score_previous: this.user.score() - scoreEarned,
    score_delta: scoreEarned,
    score_new: this.user.score(),
    achievements: [],
    commits: commits
  };

  // Render the template.
  this.$finishScreen.empty().html(template.render(args));

  // Listen to clicks.
  this.$finishScreen.on('click', '.button.to-hub', this.onHub);
  this.$finishScreen.on('click', '.button.retry', this.onRetry);
};

FinishScreen.prototype.outcome = function (isSurvival, levelProgress) {
  if (levelProgress.mistakes_left() >= 0) {
    if (levelProgress.missed() == 0) {
      return 'Flawless Victory';
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
  var commitsArg = commits.map(function (commit) {
    var json = commit.toJSON();
    json.sha_abbreviation = json.sha.slice(0, 10);
    // TODO: Track guessed state of each commit and set it in is_guessed.
    return json;
  });
  // Remove commits which the player hadn't reached.
  return commitsArg.slice(0, levelProgress.completed_round() + 1);
};
