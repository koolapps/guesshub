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
  this.game.showLevel(Campaign.MAIN.getLevelById(1),
                      this._showRepoSelectStep.bind(this));
};

Tutorial.prototype._unshade = function (var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var $el = arguments[i];
    $el.addClass('unshade');
    this._unshaded.push($el);
  }
};

Tutorial.prototype._showRepoSelectStep = function() {
  this.game.timer.stop();

  this._overlay.show();
  this._click_overlay.show();
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
      this._showStartModal();
    }.bind(this));
  }.bind(this));

  audio.play('tutorial-tip');
};

Tutorial.prototype._showStartModal = function () {
  this._unshaded.forEach(function ($el) {
    $el.removeClass('unshade');
  });
  this._overlay.hide();

  var tip = new Tip('Guess at least 5 commits to win this level. Good Luck!');
  tip.position('south');
  tip.show(this.game.$timer[0]);
  $(tip.el).addClass('no-arrow')
  animate.in(tip.el, 'fade-up');

  this.$_click_overlay.click(function () {
    animate.out(tip.el, 'fade', function () {
      tip.hide();
      this._click_overlay.hide();
      this.game.startTime = Date.now();
      this.game.timer.start();
      this.game.user.seen_tutorial(true);
    }.bind(this));
  }.bind(this));

  audio.play('tutorial-tip');
};
