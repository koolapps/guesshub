var model = require('model');
var defaults = require('model-defaults');

module.exports = model('UserLevelProgress')
  .use(defaults)
  .attr('rounds',             { default: 10 })
  .attr('completed_round',    { default: 0 })
  .attr('guessed',            { default: 0 })
  .attr('missed',             { default: 0 })
  .attr('points',             { default: 0 });
