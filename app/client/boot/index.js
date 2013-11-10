var $ = require('jquery');
var Game = require('./game');

var game = new Game({
  $timer: $('.timer'),
  $repos: $('.repo-selector'),
  $commitDisplay: $('.commit-display'),
  $levelMeter: $('.level-meter')
});

game.start();

// TODO: Add support for switchable background music.
