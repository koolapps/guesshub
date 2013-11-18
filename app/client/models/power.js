var model = require('model');
var plugins = require('./plugins');

// Immutable power descriptions.
var Power = plugins(model('Level'))
  .attr('id')
  .attr('price')
  .attr('tooltip')
  ;

// TODO: Tweak prices to match score.
Power.ALL = {
  time: new Power({
    id: 'time',
    price: 300,
    tooltip: 'Buy 25% of your time back'
  }),
  commit: new Power({
    id: 'commit',
    price: 2000,
    tooltip: 'Reveal commit metadata'
  }),
  repo: new Power({
    id: 'repo',
    price: 5000,
    tooltip: 'Reveal repository details'
  }),
  half: new Power({
    id: 'half',
    price: 42000,
    tooltip: 'Remove two wrong choices'
  })
};

module.exports = Power;
