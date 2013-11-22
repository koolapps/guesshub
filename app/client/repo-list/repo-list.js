var $ = require('jquery');
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
    });
};

RepoList.prototype.hideRepos = function(repos) {
  repos.forEach(function (repo) {
    this.$el.find('[data-id=' + repo.id() + ']').addClass('hide');
  }, this);
};

