var $ = require('jquery');
var audio = require('audio');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

module.exports = RepoList;

function RepoList (repos, onSelect) {
  this.repos = repos;
  this.onSelect = onSelect;
  this.render();
}

RepoList.prototype.render = function() {
  var repos = this.repos;

  // Extract owner and repo name from the full repo name.
  var model = {
    repos: repos.map(function (repo) {
      var result = repo.toJSON();
      var parts = result.name.split('/');
      result.owner = parts[0];
      result.name = parts[1];
      return result;
    })
  };

  // Render the list and listen to clicks.
  // TODO: Make choices respond to 1-4 keyboards keys.
  var callback = this.onSelect;
  this.$el = $(template.render(model))
    .on('click', '.repo-button', function () {
      callback(repos[$(this).closest('.repo-item').index()]);
    })
    .on('mouseenter', '.repo-button', function () {
      audio.play('click');
    });
};

RepoList.prototype.$getRepoElement = function(repo) {
  return this.$el.find('[data-id=' + repo.id() + ']');
};

RepoList.prototype.hideRepos = function(repoToLeave) {
  if (this._reposHidden) {
    return;
  }
  this._reposHidden = true;

  var hidden = 0;
  this.repos.slice().sort(function () {
    return 0.5 - Math.random();
  }).forEach(function (repo) {
    if (hidden < 2 && repo.name() != repoToLeave) {
      var $repo = this.$getRepoElement(repo);
      if (!$repo.hasClass('hide')) {
        this.$el.find('[data-id=' + repo.id() + ']').addClass('hide');
        hidden++;
      }
    }
  }, this);
};

var FADE_SPEED = 100;

RepoList.prototype.showDescription = function() {
  if (this._descShowed) {
    this._animateIntro();
    return false;
  }
  this._descShowed = true;

  var $descs = this.$descs = this.repos.map(function (repo) {
    var $repo = this.$getRepoElement(repo);
    var $div = $('<div/>', { class: 'repo-description' })
        .text(repo.description())
        .hide()
        .appendTo('body');
    $div.css('margin-left', -1 * ($div.width() / 2));
    return $div;
  }, this);

  // Bind events.
  $descs.forEach(function ($desc, i) {
    var $button = this.$getRepoElement(this.repos[i]).find('.repo-button');
    $button.mouseenter(function () {
      this._cancelAnimation = true;
      $desc.fadeIn(FADE_SPEED);
    }.bind(this)).mouseleave(function () {
      $desc.fadeOut(FADE_SPEED);
    });
  }, this);

  this._animateIntro();

  return true;
};

RepoList.prototype._animateIntro = function () {
  this._cancelAnimation = false;

  var $descs = this.$descs;

  var animateNext = function (i) {
    if (i === $descs.length || this._cancelAnimation) {
      return;
    }

    if (this.$getRepoElement(this.repos[i]).is('.hide')) {
      animateNext(i + 1);
      return;
    }

    var $button = this.$getRepoElement(this.repos[i]).find('.repo-button');
    $button.addClass('hover');
    $descs[i].fadeIn(FADE_SPEED, function () {
      setTimeout(function () {
        $button.removeClass('hover');
        $descs[i].fadeOut(FADE_SPEED, animateNext.bind(null, i + 1));
      }, 300);
    });
  }.bind(this);

  animateNext(0);
};

RepoList.prototype.destroy = function () {
  this.$descs.forEach(function ($d) {
    $d.remove();
  });
};
