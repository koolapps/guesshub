var $ = require('jquery');
var Timer = require('timer');
var LevelMeter = require('level-meter');
var model = require('model');

var UserLevelProgress = model('UserLevelProgress')
  .attr('rounds')
  .attr('completed_round')
  .attr('guessed')
  .attr('missed')
  .attr('points');

var progress = new UserLevelProgress();
window.progress = progress;
progress.rounds(10).completed_round(2).guessed(1).missed(1).points(30);

LevelMeter($('.level-meter'), progress);

var timer = new Timer($('.timer'), {
  interval: 10
});
timer.start();
