var model = require('model');
var plugins = require('./plugins');

module.exports = plugins(model('UserLevelProgress'))
  .attr('rounds',             { default: 10 })
  .attr('completed_round',    { default: 0 })
  .attr('guessed',            { default: 0 })
  .attr('missed',             { default: 0 })
  .attr('points',             { default: 0 });
