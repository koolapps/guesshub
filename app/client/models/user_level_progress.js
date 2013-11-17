var model = require('model');
var plugins = require('./plugins');

module.exports = plugins(model('UserLevelProgress'))
  .attr('rounds')
  .attr('completed_round')
  .attr('guessed')
  .attr('missed')
  .attr('points')
  .attr('mistakes_left');
