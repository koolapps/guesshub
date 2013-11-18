var $ = require('jquery');
var model = require('model');
var Level = require('./level');
var plugins = require('./plugins');

// Immutable collection of levels.
// TODO: Update the user model with campaign progress.
// TODO: Add bonus levels.
var Campaign = plugins(model('Campaign'))
  .attr('intro_levels')
  .attr('fast_levels')
  .attr('hard_levels')
  .attr('final_level')
  .attr('survival_level')
  ;

Campaign.on('construct', function (model) {
  model._levelsByName = {};
  var levelsByName = {};
  var index = function(level) {
    var name = level.name();
    if (name in model._levelsByName) {
      throw Error('Duplicate level name: ' + name);
    } else {
      model._levelsByName[name] = level;
    }
  };
  model.intro_levels().map(index);
  model.fast_levels().map(index);
  model.hard_levels().map(index);
  index(model.final_level());
  index(model.survival_level());
});

Campaign.prototype.getByName = function (name) {
  if (!(name in this._levelsByName)) {
    throw Error('No level named: ' + name);
  }
  return this._levelsByName[name];
};

Campaign.MAIN = new Campaign({
  intro_levels: [
    new Level({
      name: '0. git ready',
      min_grade: 0,
      max_grade: 10,
      num_mistakes_allowed: 5,
      timer: 60
    }),
    new Level({
      name: '1. git set',
      min_grade: 0,
      max_grade: 20,
      num_mistakes_allowed: 4,
      timer: 50
    }),
    new Level({
      name: '2. git going',
      min_grade: 0,
      max_grade: 30,
      num_mistakes_allowed: 3,
      timer: 40
    })
  ],
  fast_levels: [
    new Level({
      name: '3f. pull a fast one',
      min_grade: 5,
      max_grade: 20,
      num_mistakes_allowed: 2,
      timer: 20
    }),
    new Level({
      name: '4f. TODO',
      min_grade: 5,
      max_grade: 20,
      num_mistakes_allowed: 2,
      timer: 15
    }),
    new Level({
      name: '5f. TODO',
      min_grade: 5,
      max_grade: 20,
      num_mistakes_allowed: 1,
      timer: 10
    }),
    new Level({
      name: '6f. TODO',
      min_grade: 5,
      max_grade: 20,
      num_mistakes_allowed: 1,
      timer: 5
    })
  ],
  hard_levels: [
    new Level({
      name: '3h. TODO',
      min_grade: 35,
      max_grade: 50,
      num_mistakes_allowed: 2,
      timer: 30
    }),
    new Level({
      name: '4h. TODO',
      min_grade: 50,
      max_grade: 65,
      num_mistakes_allowed: 2,
      timer: 30
    }),
    new Level({
      name: '5h. TODO',
      min_grade: 65,
      max_grade: 80,
      num_mistakes_allowed: 1,
      timer: 30
    }),
    new Level({
      name: '6h. TODO',
      min_grade: 80,
      max_grade: 95,
      num_mistakes_allowed: 1,
      timer: 30
    })
  ],
  final_level: new Level({
    name: 'push through',
    num_rounds: 20,
    min_grade: 0,
    max_grade: 100,
    num_mistakes_allowed: 1
  }),
  survival_level: new Level({
    name: 'survival',
    num_rounds: 256,
    min_grade: 0,
    max_grade: 100,
    num_mistakes_allowed: 3
  })
});

module.exports = Campaign;
