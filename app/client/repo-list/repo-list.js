var $ = require('jquery')
var Hogan = require('hogan.js')
var template = Hogan.compile(require('./template'));

// TODO: Make choices respond to 1-4 keyboards keys.
module.exports = function (repos, callback) {
  var model = {
    repos: repos.map(function (repo) {
      var result = repo.toJSON();
      result.name = result.name.replace('/', '\n');
      return result;
    })
  };

  return $(template.render(model))
    .addClass('large-block-grid-' + repos.length)
    .on('click', 'li', function () {
      callback(repos[$(this).index()]);
    });
};