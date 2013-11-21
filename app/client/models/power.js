var model = require('model');
var plugins = require('./plugins');

// Immutable power descriptions.
var Power = plugins(model('Level'))
  .attr('id')
  .attr('price')
  .attr('tooltip')
  .attr('icon')
  ;

// TODO: Tweak prices to match score.
Power.ALL = {
  time: new Power({
    id: 'time',
    price: 300,
    tooltip: 'Rewind \xa0the timer',  // \xa0 to force wrapping
    icon: 'clock-o'
  }),
  commit: new Power({
    id: 'commit',
    price: 2000,
    tooltip: 'Reveal commit details',
    icon: 'user'
  }),
  repo: new Power({
    id: 'repo',
    price: 5000,
    tooltip: 'Reveal repo details',
    icon: 'info-circle'
  }),
  half: new Power({
    id: 'half',
    price: 42000,
    tooltip: 'Reduce wrong choices',
    icon: 'adjust'
  })
};

module.exports = Power;
