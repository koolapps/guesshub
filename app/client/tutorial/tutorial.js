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
var dialog = require('dialog');
var audio = require('audio');

module.exports = function (game) {
  new Tutorial(game).start();
};

function Tutorial (game) {
  this.game = game;
}

Tutorial.prototype.start = function () {
  var level = Campaign.MAIN.getLevelById(1);
  $.when(
    level.fetchRounds(),
    $.getJSON('/tutorial_round')
  ).then(function (rounds, args2) {
    var data = args2[0];
    var tutorialRound = new Round({
      commit: new Commit(data.commit),
      repos: data.repos.map(Repo),
      constant_timer: 60
    });
    rounds[0] = tutorialRound;

    this.game.clear();
    this.game._initLevel(level, rounds);
    this.game.startRound();

    this._showRepoSelectStep();
  }.bind(this));
};

Tutorial.prototype._unshade = function ($el) {
  $el.addClass('unshade');
  if (!this._unshaded) {
    this._unshaded = [];
  }
  this._unshaded.push($el);
  return this;
};

Tutorial.prototype._showRepoSelectStep = function() {
  var overlay = this.overlay = Overlay();
  overlay.show();
  this._unshade(this.game.$repos)
      ._unshade(this.game.$commitDisplay);

  var html = '<p>Select which repository this commit comes from</p>';
  html += '<p class="icon-container"><i class="fa fa-arrow-circle-right next"></i></p>';
  var tip = new Tip(html);
  tip.position('south');
  tip.show(this.game.$repos[0]);
  animate.in(tip.el, 'fade-up');
  var $next = $(tip.el).find('.next');
  var $buttons = this.game.$repos.find('.repo-button');
  $next.click(function () {
    $buttons.off('.tutorial');
    animate.out(tip.el, 'fade-down', false, function () {
      $(tip.el).remove();
      this._showTimerStep();
    }.bind(this));
  }.bind(this));
  // Hack to intercept repo selection.
  $buttons.on('click.tutorial', function () {
    $buttons.off('.tutorial');
    $next.click();
    return false;
  });
};


Tutorial.prototype._showTimerStep = function () {
  this._unshade(this.game.$timer);
  var html = '<p>Quick, choose before the time runs out!</p>';
  html += '<p class="icon-container"><i class="fa fa-arrow-circle-right next"></i></p>';
  var tip = new Tip(html);
  tip.position('west');
  tip.show(this.game.$timer[0]);
  animate.in(tip.el, 'fade-left');
  var $next = $(tip.el).find('.next');
  $next.click(function () {
    animate.out(tip.el, 'fade-right', function () {
      $(tip.el).remove();
      this._showStartModal();
    }.bind(this));
  }.bind(this));


  this.game.interceptOnFinshRound(function (won) {
    if (won) {
      this.game.disableFinishRoundInterception();
      this.game.onFinishRound(won);
      $next.click();
    } else {
      audio.play('miss');
      this.game.timer.rewind(1);
    }
  }.bind(this));
};

Tutorial.prototype._showStartModal = function () {
  this._unshaded.forEach(function ($el) {
    $el.removeClass('unshade');
  });

  var msg = 'Guess at least 5 commits to win this level. Good Luck!';
  var d = dialog(msg);
  var iconHtml = '<p class="icon-container"><i class="fa fa-arrow-circle-right next"></i></p>';
  $(d.el).find('.body').append(iconHtml);
  d.closable()
    .overlay()
    .addClass('start-game-modal')
    .show();
  animate.in(d.el, 'fade');
  $('.overlay').css('background', 'none');
  $(d.el).find('.next').click(function () {
    d.hide();
  });
  d.on('hide', function () {
    debugger;
    this.game.timer.rewind(1);
    this.overlay.remove();
    console.log($('.overlay').remove())
    
  }.bind(this));
};
