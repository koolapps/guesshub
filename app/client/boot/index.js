var $ = require('jquery');
var Game = require('./game');
var User = require('models').User;
var Campaign = require('models').Campaign;

// TODO: Support storing user state.
var user = new User();

var game = new Game({
  user: user,
  campaign: Campaign.MAIN,
  $timer: $('#timer'),
  $repos: $('#repo-selector'),
  $scoreCard: $('#score-card'),
  $levelStats: $('#level-stats'),
  $commitDisplay: $('#commit-display'),
  $powerList: $('#power-list'),
  $levelHub: $('#level-hub'),
  $finishScreen: $('#finish-screen'),
  $finishHeader: $('#finish-header'),
  $hearts: $('#hearts'),
  $logo: $('#logo'),
  $audioToggle: $('#audio-toggle')
});

game.start();

// TODO: Remove in non-debug builds.
window.game = game;

// TODO: Add support for switchable background music.
// TODO: Prevent accidental navigation away from the page.
