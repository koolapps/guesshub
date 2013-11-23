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

RepoList.prototype.hideRepos = function(repoToLeave) {
  var hidden = 0;
  this.repos.slice().sort(function () {
    return 0.5 - Math.random();
  }).forEach(function (repo) {
    if (hidden < 2 && repo.name() != repoToLeave) {
      var $repo =  this.$el.find('[data-id=' + repo.id() + ']');
      if (!$repo.hasClass('hide')) {
        this.$el.find('[data-id=' + repo.id() + ']').addClass('hide');
        hidden++;
      }
    }
  }, this);
};

