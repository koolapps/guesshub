var $ = require('jquery');
var Repo = require('models').Repo;
var Timer = require('timer');
var Commit = require('models').Commit
var repoList = require('repo-list');
var levelMeter = require('level-meter');
var CommitDisplay = require('commit-display');
var UserLevelProgress = require('models').UserLevelProgress;

var progress = new UserLevelProgress()
$('.level-meter').append(levelMeter(progress));

function startGame (data) {
  var repos = data.repos.map(Repo);
  var commit = new Commit(data.commit);

  console.log('psst', commit.repository());

  var timer = new Timer({
    interval: 15
  , outerRadius: $('.timer').height() / 2
  , onComplete: finishGame.bind(null, false)
  });
  // timer.start();
  $('.timer').empty().append(timer.$el);

  $('.repo-selector').empty().append(
    repoList(repos, function (repo) {
      timer.stop();
      finishGame(repo.name() === commit.repository());
    })
  )

  var commitDisplay = new CommitDisplay(commit);
  $('.commit-display').empty().append(commitDisplay.$el);
  commitDisplay.setVisibility({ metadata: false });
}

function finishGame (won) {
  // TODO: Add sound effects on win/loss.
  if (won) {
    progress.guessed(progress.guessed() + 1);
  } else {
    progress.missed(progress.missed() + 1);
  }
  progress.completed_round(progress.completed_round() + 1);
  if (progress.completed_round() === progress.rounds()) {
    alert('level complete! refresh page to start a new round');
  } else {
    $.getJSON('/commit', startGame);
  }
}

$.getJSON('/commit', startGame);

// TODO: Add support for switchable background music.
