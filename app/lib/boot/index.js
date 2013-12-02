var $ = require('jquery');
var Game = require('./game');
var User = require('models').User;
var Campaign = require('models').Campaign;
var Track = require('track');

var shareButtons = require('share-buttons');
var router = require('./router');
var audio = require('audio');

audio.initialize($('#audio-toggle'));
Track.initialize();

var user = User.loadOrCreate();

var game = new Game({
  user: user,
  campaign: Campaign.MAIN,
  $container: $('#content'),
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
  $logo: $('#logo')
});

$('#content').show();

router.start(game);
if (user.seen_tutorial()) {
  router.dispatch();
} else {
  game.start();
}

window.onunload = function () {
  user.persist();
};

shareButtons();

// TODO: Add support for switchable background music.
