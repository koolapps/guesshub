var model = require('model');
var plugins = require('./plugins');

module.exports = plugins(model('Commit'))
  .attr('sha')
  .attr('patch_number')
  .attr('message')
  .attr('author_login')
  .attr('author_avatar_url')
  .attr('author_name')
  .attr('repository')
  .attr('file_contents_url')
  .attr('file_contents')
  .attr('filename')
  .attr('additions')
  .attr('deletions')
  .attr('old_start_line')
  .attr('new_start_line')
  .attr('block_name')
  .attr('diff_lines')
  .attr('grade')
  ;
