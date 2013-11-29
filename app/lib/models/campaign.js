var $ = require('jquery');
var model = require('model');
var Level = require('./level');
var plugins = require('./plugins');

// Immutable collection of levels.
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
  var requires = this.getLevelById(levelId).requires();
  // Clone.
  requires = requires.slice();

  return requires.length === 0 ||
    completedLevelIds.some(function (id) {
      var completedLevel = this.getLevelById(id);
      var idx = requires.indexOf(id);
      if (idx > -1) {
        requires.splice(idx, 1);
      }
      if (requires.length === 0) {
        return true;
      }
    }, this);
};

Campaign.prototype.toJSONWithUserProgress = function (user) {
  var json = this.toJSON();
  var completedLevelIds = user.completed_level_ids();
  var that = this;
  function computeIsUnlocked (levelJSON) {
    levelJSON.is_completed = completedLevelIds.indexOf(levelJSON.id) != -1;
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
      min_grade: 10,
      max_grade: 30,
      num_mistakes_allowed: 4,
      timer: 60,
      requires: []
    }),
    new Level({
      id: 2,
      name: '1. git set',
      min_grade: 15,
      max_grade: 35,
      num_mistakes_allowed: 3,
      timer: 45,
      requires: [1]
    }),
    new Level({
      id: 3,
      name: '2. git going',
      min_grade: 30,
      max_grade: 45,
      num_mistakes_allowed: 2,
      timer: 30,
      requires: [2]
    })
  ],
  fast_levels: [
    new Level({
      id: 4,
      name: '3f. the fast lane',
      min_grade: 10,
      max_grade: 40,
      num_mistakes_allowed: 2,
      timer: 20,
      requires: [3]
    }),
    new Level({
      id: 5,
      name: '4f. pull a fast one',
      min_grade: 10,
      max_grade: 40,
      num_mistakes_allowed: 2,
      timer: 15,
      requires: [4]
    }),
    new Level({
      id: 6,
      name: '5f. checking in',
      min_grade: 10,
      max_grade: 40,
      num_mistakes_allowed: 1,
      timer: 10,
      requires: [5]
    }),
    new Level({
      id: 7,
      name: '6f. head to head',
      min_grade: 10,
      max_grade: 40,
      num_mistakes_allowed: 1,
      timer: 5,
      requires: [6]
    })
  ],
  hard_levels: [
    new Level({
      id: 8,
      name: '3h. git-to-work',
      min_grade: 45,
      max_grade: 65,
      num_mistakes_allowed: 2,
      timer: 30,
      requires: [3]
    }),
    new Level({
      id: 9,
      name: '4h. up a tree',
      min_grade: 65,
      max_grade: 75,
      num_mistakes_allowed: 2,
      timer: 30,
      requires: [8]
    }),
    new Level({
      id: 10,
      name: '5h. reset hard',
      min_grade: 75,
      max_grade: 85,
      num_mistakes_allowed: 1,
      timer: 30,
      requires: [9]
    }),
    new Level({
      id: 11,
      name: '6h. the tough git going',
      min_grade: 85,
      max_grade: 100,
      num_mistakes_allowed: 1,
      timer: 30,
      requires: [10]
    })
  ],
  final_level: new Level({
    id: 12,
    name: 'push through',
    num_rounds: 25,
    min_grade: 15,
    max_grade: 100,
    num_mistakes_allowed: 1,
    requires: [7, 10]
  }),
  survival_level: new Level({
    id: 13,
    name: 'survival',
    num_rounds: 256,
    min_grade: 0,
    max_grade: 100,
    num_mistakes_allowed: 3,
    requires: [12]
  })
});

module.exports = Campaign;
