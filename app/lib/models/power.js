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
    price: 400,
    tooltip: 'Rewind \xa0the timer',  // \xa0 to force wrapping
    icon: 'clock-o'
  }),
  repo: new Power({
    id: 'repo',
    price: 1000,
    tooltip: 'Reveal repo details',
    icon: 'folder-open'
  }),
  commit: new Power({
    id: 'commit',
    price: 1600,
    tooltip: 'Reveal commit details',
    icon: 'tags'
  }),
  half: new Power({
    id: 'half',
    price: 2400,
    tooltip: 'Reduce wrong choices',
    icon: 'adjust'
  })
};

module.exports = Power;
