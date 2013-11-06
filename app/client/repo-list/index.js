var $ = require('jquery')
var repoItem = require('repo-item');
var template = require('./template');

module.exports = function (models) {
  var repoItems = models.map(repoItem);
  return $(template).addClass('large-block-grid-' + models.length).append(repoItems);
}