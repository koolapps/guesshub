var $ = require('jquery')
var Hogan = require('hogan.js')
var template = Hogan.compile(require('./template'));

module.exports = function (repos, callback) {
  var model = {
    repos: repos.map(function (repo) {
      return repo.toJSON();
    })
  };

  return $(template.render(model))
    .addClass('large-block-grid-' + repos.length)
    .on('click', 'li', function () {
      callback(repos[$(this).index()]);
    });
};