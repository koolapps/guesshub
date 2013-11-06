var model = require('model');

module.exports = model('UserLevelProgress')
  .attr('rounds')
  .attr('completed_round')
  .attr('guessed')
  .attr('missed')
  .attr('points');
