var model = require('model');
var plugins = require('./plugins');

var Repo = plugins(model('Repo'))
    .attr('id')
    .attr('name')
    .attr('author')
    .attr('author_avatar_url')
    .attr('description')
    .attr('watcher_count')
    .attr('star_count')
    .attr('hidden');

Repo.on('construct', function (m) {
  if (!m.description()) {
    m.description('No description :(');
  }
});

module.exports = Repo;