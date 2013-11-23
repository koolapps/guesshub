var model = require('model');
var plugins = require('./plugins');

// Immutable power descriptions.
var Power = plugins(model('Level'))
  .attr('id')
  .attr('price')
  .attr('tooltip')
  .attr('icon')
  ;

Power.ALL = {
  time: new Power({
    id: 'time',
    price: 500,
    tooltip: 'Rewind \xa0the timer',  // \xa0 to force wrapping
    icon: 'clock-o'
  }),
  commit: new Power({
    id: 'commit',
    price: 2000,
    tooltip: 'Reveal commit details',
    icon: 'tags'
  }),
  repo: new Power({
    id: 'repo',
    price: 5000,
    tooltip: 'Reveal repo details',
    icon: 'folder-open'
  }),
  half: new Power({
    id: 'half',
    price: 10000,
    tooltip: 'Reduce wrong choices',
    icon: 'adjust'
  })
};

module.exports = Power;
