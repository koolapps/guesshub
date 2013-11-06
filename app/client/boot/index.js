var $ = require('jquery');
var Timer = require('timer');
var levelMeter = require('level-meter');
var UserLevelProgress = require('models').UserLevelProgress;

var progress = new UserLevelProgress()
  .rounds(10)
  .completed_round(2)
  .guessed(1)
  .missed(1)
  .points(30);

levelMeter($('.level-meter'), progress);

var timer = new Timer($('.timer'), {
  interval: 10
});
timer.start();
