var $ = require('jquery')
var repoItem = require('repo-item');
var template = require('./template');

module.exports = function (models, callback) {
  var repoItems = models.map(repoItem);
  return $(template)
    .addClass('large-block-grid-' + models.length)
    .append(repoItems)
    .on('click', 'li', function () {
      callback(models[$(this).index()]);
    });
};