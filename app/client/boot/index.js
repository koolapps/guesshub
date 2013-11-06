var $ = require('jquery');
var Repo = require('models').Repo;
var Timer = require('timer');
var repoList = require('repo-list');
var levelMeter = require('level-meter');
var UserLevelProgress = require('models').UserLevelProgress;

var progress = new UserLevelProgress()
  .rounds(10)
  .completed_round(2)
  .guessed(1)
  .missed(1)
  .points(30);

var repos = [
  new Repo().name('amasad/hello'),
  new Repo().name('amasad/we_trippy_mane'),
  new Repo().name('max/thangs'),
  new Repo().name('amasad/purp_drank')
];

$('.repo-selector').append(repoList(repos));
levelMeter($('.level-meter'), progress);

var timer = new Timer($('.timer'), {
  interval: 10
});
timer.start();
