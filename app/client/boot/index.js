var $ = require('jquery');
var Timer = require('timer');

var timer = new Timer($('.timer'), {
  interval: 10
});
timer.start();
