var $ = require('jquery');
var Repo = require('models').Repo;
var Timer = require('timer');
var Commit = require('models').Commit
var repoList = require('repo-list');
var levelMeter = require('level-meter');
var commitDisplay = require('commit-display');
var UserLevelProgress = require('models').UserLevelProgress;

var progress = new UserLevelProgress()
levelMeter($('.level-meter'), progress);

function startGame (data) {
  var repos = data.repos.map(Repo);
  var commit = new Commit(data.commit);

  console.log('pssst', commit.repository());

  var timer = new Timer($('.timer').empty(), {
    interval: 15
  , onComplete: finishGame.bind(null, false)
  });
  timer.start();

  $('.repo-selector').empty().append(
    repoList(repos, function (repo) {
      timer.stop();
      finishGame(repo.name() === commit.repository());
    })
  )

  commitDisplay($('.commit-display').empty(), commit);
}

function finishGame (won) {
  if (won) {
    progress.guessed(progress.guessed() + 1);
  } else {
    progress.missed(progress.missed() + 1);
  }
  progress.completed_round(progress.completed_round() + 1);
  if (progress.completed_round() === progress.rounds()) {
    alert('round finished');
  } else {
    $.getJSON('/commit', startGame);
  }
}

$.getJSON('/commit', startGame);
