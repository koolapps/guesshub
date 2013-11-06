var $ = require('jquery');
var Repo = require('models').Repo;
var Timer = require('timer');
var Commit = require('models').Commit
var repoList = require('repo-list');
var levelMeter = require('level-meter');
var commitDisplay = require('commit-display');
var UserLevelProgress = require('models').UserLevelProgress;

var progress = new UserLevelProgress()
  .rounds(10)
  .completed_round(0)
  .guessed(0)
  .missed(0)
  .points(0);



function startGame (data) {
  var repos = data.repos.map(Repo);
  var commit = new Commit(data.commit);
  var progress = new UserLevelProgress();

  $('.repo-selector').append(repoList(repos));
  levelMeter($('.level-meter'), progress);
  commitDisplay($('.commit-display'), commit);
  var timer = new Timer($('.timer'), {
    interval: 10
  });
  timer.start();
}

$.getJSON('/commit', startGame);
