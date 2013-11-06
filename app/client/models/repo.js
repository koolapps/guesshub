var model = require('model');

module.exports = model('Repo')
    .attr('id')
    .attr('name')
    .attr('author')
    .attr('author_avatar_url')
    .attr('description')
    .attr('watcher_count')
    .attr('star_count');
