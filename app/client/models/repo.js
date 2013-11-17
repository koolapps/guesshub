var model = require('model');
var plugins = require('./plugins');

module.exports = plugins(model('Repo'))
    .attr('id')
    .attr('name')
    .attr('author')
    .attr('author_avatar_url')
    .attr('description')
    .attr('watcher_count')
    .attr('star_count')
    .attr('hidden');
