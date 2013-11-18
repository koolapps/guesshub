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
  model._flattenLevels();
});

Campaign.prototype._flattenLevels = function () {
  var levels = this._levels = [];
  function store (level) {
    levels.push(level);
  }
  this.intro_levels().forEach(store);
  this.fast_levels().forEach(store);
  this.hard_levels().forEach(store);
  store(this.final_level());
  store(this.survival_level());
};

Campaign.prototype.getLevelById = function (id) {
  var level = this._levels.filter(function (l) {
    return l.id() === id;
  })[0];
  console.assert(level, 'Not expecting unknown ids');
  return level;
};

Campaign.prototype.isUnlocked = function(levelId, completedLevelIds) {
  return levelId === 1 || completedLevelIds.some(function (id) {
    var completedLevel = this.getLevelById(id);
    return completedLevel.unlocks().indexOf(levelId) > -1;
  }, this);
};

Campaign.prototype.toJSONWithUserProgress = function (user) {
  var json = this.toJSON();
  var completedLevelIds = user.completed_level_ids();
  var that = this;
  function computeIsUnlocked (levelJSON) {
    levelJSON.is_unlocked = that.isUnlocked(levelJSON.id, completedLevelIds);
  }
  json.intro_levels.forEach(computeIsUnlocked);
  json.fast_levels.forEach(computeIsUnlocked);
  json.hard_levels.forEach(computeIsUnlocked);
  computeIsUnlocked(json.final_level);
  computeIsUnlocked(json.survival_level);
  return json;
};

Campaign.MAIN = new Campaign({
  intro_levels: [
    new Level({
      id: 1,
      name: '0. git ready',
      min_grade: 0,
      max_grade: 10,
      num_mistakes_allowed: 5,
      timer: 60,
      unlocks: [2]
    }),
    new Level({
      id: 2,
      name: '1. git set',
      min_grade: 0,
      max_grade: 20,
      num_mistakes_allowed: 4,
      timer: 50,
      unlocks: [3]
    }),
    new Level({
      id: 3,
      name: '2. git going',
      min_grade: 0,
      max_grade: 30,
      num_mistakes_allowed: 3,
      timer: 40,
      unlocks: [4, 8]
    })
  ],
  fast_levels: [
    new Level({
      id: 4,
      name: '3f. pull a fast one',
      min_grade: 5,
      max_grade: 20,
      num_mistakes_allowed: 2,
      timer: 20,
      unlocks: [5, 9]
    }),
    new Level({
      id: 5,
      name: '4f. TODO',
      min_grade: 5,
      max_grade: 20,
      num_mistakes_allowed: 2,
      timer: 15,
      unlocks: [6, 10]
    }),
    new Level({
      id: 6,
      name: '5f. TODO',
      min_grade: 5,
      max_grade: 20,
      num_mistakes_allowed: 1,
      timer: 10,
      unlocks: [7, 11]
    }),
    new Level({
      id: 7,
      name: '6f. TODO',
      min_grade: 5,
      max_grade: 20,
      num_mistakes_allowed: 1,
      timer: 5,
      unlocks: [12]
    })
  ],
  hard_levels: [
    new Level({
      id: 8,
      name: '3h. TODO',
      min_grade: 35,
      max_grade: 50,
      num_mistakes_allowed: 2,
      timer: 30,
      unlocks: [5, 9]
    }),
    new Level({
      id: 9,
      name: '4h. TODO',
      min_grade: 50,
      max_grade: 65,
      num_mistakes_allowed: 2,
      timer: 30,
      unlocks: [6, 10]
    }),
    new Level({
      id: 10,
      name: '5h. TODO',
      min_grade: 65,
      max_grade: 80,
      num_mistakes_allowed: 1,
      timer: 30,
      unlocks: [7, 11]
    }),
    new Level({
      id: 11,
      name: '6h. TODO',
      min_grade: 80,
      max_grade: 95,
      num_mistakes_allowed: 1,
      timer: 30,
      unlocks: [12]
    })
  ],
  final_level: new Level({
    id: 12,
    name: 'push through',
    num_rounds: 20,
    min_grade: 0,
    max_grade: 100,
    num_mistakes_allowed: 1,
    unlocks: [13]
  }),
  survival_level: new Level({
    id: 13,
    name: 'survival',
    num_rounds: 256,
    min_grade: 0,
    max_grade: 100,
    num_mistakes_allowed: 3,
    unlocks: []
  })
});

module.exports = Campaign;
