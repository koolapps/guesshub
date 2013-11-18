var $ = require('jquery');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

// TODO: Add icons.
// Shows the results of a level.
module.exports = function (user, level, commits, levelProgress,
                           hubCallback, retryCallback) {
  // Render the template.
  var $el = $('<div/>', { class: 'finish-screen' });
  $el.html(template.render(templateArgs(user, level, commits, levelProgress)));

  // Listen to clicks.
  $el.on('click', '.button.to-hub', hubCallback);
  $el.on('click', '.button.retry', retryCallback);

  return $el;
};

function templateArgs (user, level, commits, levelProgress) {
  var args = {};

  // The main outcome.
  if (levelProgress.mistakes_left() >= 0) {
    if (levelProgress.missed() == 0) {
      args.outcome = 'Flawless Victory';
      args.outcome_id = 'flawless-victory';
    }  else {
      args.outcome = 'Victory';
      args.outcome_id = 'victory';
    }
  } else {
    if (level.name() == 'survival') {
      // Special case: the survival level has no defeat.
      args.outcome = 'The End';
      args.outcome_id = 'end';
    } else {
      args.outcome = 'Defeat';
      args.outcome_id = 'defeat';
    }
  }

  // Outcome flags.
  args.is_defeat = args.outcome_id == 'defeat';
  args.is_victory = args.outcome_id != 'defeat';

  // Score.
  args.score_previous = user.score() - levelProgress.score_earned();
  args.score_delta = levelProgress.score_earned();
  args.score_new = user.score();

  // TODO: Achievements.
  args.achievements = [];

  args.commits = commits.map(function (commit) {
    var json = commit.toJSON();
    json.sha_abbreviation = json.sha.slice(0, 10);
    // TODO: Track guessed state of each commit and set it in is_guessed.
    return json;
  });
  // Remove commits which the player hadn't reached.
  args.commits = args.commits.slice(0, levelProgress.completed_round() + 1);

  console.log(args);
  return args;
};
