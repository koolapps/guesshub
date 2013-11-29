var $ = require('jquery');

var models = require('models');
var Commit = models.Commit;
var Repo = models.Repo;
var Level = models.Level;
var Round = models.Round;
var Campaign = models.Campaign;

var Overlay = require('overlay');
var animate = require('animate');
var Tip = require('tip');
var audio = require('audio');

module.exports = Tutorial;

function Tutorial (game) {
  this.game = game;
  this._unshaded = [];
  this._overlay = Overlay();
  this._click_overlay = Overlay();
  this.$_click_overlay = $(this._click_overlay.el.els[0]);
  this.$_click_overlay.addClass('click-overlay');
}

Tutorial.prototype.start = function () {
  this._showIntroStep();
};

Tutorial.prototype._unshade = function (var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var $el = arguments[i];
    $el.addClass('unshade');
    this._unshaded.push($el);
  }
};

Tutorial.prototype._showIntroStep = function() {
  this._overlay.show();
  this.game.clear();

  // Set up a functio wait for both the intro and the level load.
  var level = Campaign.MAIN.getLevelById(1);
  var readyCount = 2;
  var savedRounds = null;
  var ready = function  () {
    readyCount--;
    if (readyCount == 0) {
      // Once we're ready, start the game.
      this.game.initLevel(level, savedRounds);
      this._showRepoSelectStep();
    }
  }.bind(this);

  // Start loading the level.
  this.game.loadLevel(level, function (rounds) {
    savedRounds = rounds;
    ready();
  });

  // Play the animation.
  var top = $('<div>').attr('id', 'intro-top').text('Guess')
      .appendTo('body')[0];
  var bottom = $('<div>').attr('id', 'intro-bottom').text('Hub')
      .appendTo('body')[0];

  $(top, bottom).show();
  animate.in(top, 'bounce-down');
  setTimeout(animate.in.bind(animate, bottom, 'bounce-up', function () {
    animate.out(top, 'bounce-up', function() { $(top).remove() });
    setTimeout(animate.out.bind(animate, bottom, 'bounce-down', function () {
      $(bottom).remove();
      ready();
    }.bind(this)), 100);
  }.bind(this)), 150);
};

Tutorial.prototype._showRepoSelectStep = function() {
  this._click_overlay.show();
  this.game.timer.stop();

  this._unshade(this.game.$repos, this.game.$commitDisplay);

  var tip = new Tip('Select which repository this commit comes from.');
  tip.position('south');
  tip.show(this.game.$repos[0]);
  animate.in(tip.el, 'fade-up');

  this.$_click_overlay.click(function () {
    animate.out(tip.el, 'fade-down', false, function () {
      $(tip.el).remove();
      this._showTimerStep();
    }.bind(this));
  }.bind(this));

  audio.play('tutorial-tip');
};

Tutorial.prototype._showTimerStep = function () {
  this._unshade(this.game.$timer);

  var tip = new Tip('Quick! Choose before the time runs out!');
  tip.position('west');
  tip.show(this.game.$timer[0]);
  animate.in(tip.el, 'fade-left');

  this.$_click_overlay.click(function () {
    animate.out(tip.el, 'fade-right', function () {
      $(tip.el).remove();
      this._unshadeAll();
      this._overlay.hide();
      this._click_overlay.hide();
      this.game.startTime = Date.now();
      this.game.timer.start();
      this.game.user.seen_tutorial(true);
    }.bind(this));
  }.bind(this));

  audio.play('tutorial-tip');
};

Tutorial.prototype._unshadeAll = function () {
  this._unshaded.forEach(function ($el) {
    $el.removeClass('unshade');
  });
};

Tutorial.prototype.showPowerHint = function() {
  this._overlay.show();
  this._click_overlay.show();
  this._unshade(this.game.$powerList);
  this._unshade(this.game.$scoreCard);

  var tip = new Tip('Purchase power-ups with score gained during levels.');
  tip.position('south');
  tip.show(this.game.$powerList[0]);
  animate.in(tip.el, 'fade-down');

  this.$_click_overlay.click(function () {
    animate.out(tip.el, 'fade-down', function () {
      $(tip.el).remove();
      this._unshadeAll();
      this._overlay.hide();
      this._click_overlay.hide();
      this.game.user.seen_power_hint(true);
    }.bind(this));
  }.bind(this));

  audio.play('tutorial-tip');
};
