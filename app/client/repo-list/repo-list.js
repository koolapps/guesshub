var $ = require('jquery')
var Hogan = require('hogan.js')
var template = Hogan.compile(require('./template'));

// TODO: Make choices respond to 1-4 keyboards keys.
module.exports = function (repos, callback) {
  var model = {
    repos: repos.map(function (repo) {
      var result = repo.toJSON();
      var parts = result.name.split('/');
      result.owner = parts[0];
      result.name = parts[1];
      return result;
    })
  };

  return $(template.render(model))
    .on('click', 'li', function () {
      callback(repos[$(this).index()]);
    });
};