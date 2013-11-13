var $ = require('jquery');
var Game = require('./game');
var User = require('models').User;

var user = new User();

var game = new Game({
  user: user,
  $timer: $('#timer'),
  $repos: $('#repo-selector'),
  $scoreCard: $('#score-card'),
  $levelMeter: $('#level-meter'),
  $commitDisplay: $('#commit-display'),
});

game.start();

// TODO: Add support for switchable background music.
