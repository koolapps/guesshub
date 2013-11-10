var $ = require('jquery')
var model = require('model');
var Repo = require('./repo');
var Commit = require('./commit');
var plugins = require('./plugins');

var LEVELS_PATH = [
  [ 'regular' ],
  [ 'regular' ],
  [ 'regular' ],
  [ 'fast', 'hard' ],
  [ 'fast', 'hard' ],
  [ 'bonus' ],
  [ 'fast', 'hard' ],
  [ 'fast', 'hard' ],
  [ 'final' ],
  [ 'survival' ],
];

var LEVEL_TYPES = ['regular', 'fast', 'hard', 'bonus', 'final', 'survival'];

var LEVEL_DIFFICULTY = {
  fast: [0, 25],
  hard: [25, 50],
  regular: [0, 25],
  bonus: [0, 25],
  all: [0, 50]
};

var ROUNDS_PER_LEVEL = {
  regular: 10,
  fast: 10,
  hard: 10,
  final: 20,
  survival: 100,
};

//              /-fst-fst-bns-fst-fst-\
// reg-reg-reg-|                       |-final-survival
//              \-hrd-hrd-bns-hrd-hrd-/
// “faster”: easy commits but low timer.
// “harder”: long, keyword-less commits but long time.

var LEVEL_RULES = {
  regular: {
    0: { mistakes: 5, timer: 60 },
    1: { mistakes: 4, timer: 50 },
    2: { mistakes: 3, timer: 40 },
  },
  fast: {
    3: { mistakes: 2, timer: 20 },
    4: { mistakes: 2, timer: 15 },
    6: { mistakes: 1, timer: 5 },
    7: { mistakes: 1, timer: 5 },
  },
  hard: {
    3: { mistakes: 5, timer: 30 },
    4: { mistakes: 5, timer: 30 },
    6: { mistakes: 5, timer: 30 },
    7: { mistakes: 5, timer: 30 },
  },
  bonus: {
    5: { mistakes: 0, timer: 15 },
  },
  final: {
    8: { mistakes: 0, timer: 15 },
  },
  survival: {
    9: { mistakes: 3 },
  }
};

var Round = plugins(model('Round'))
  .attr('commit')
  .attr('repos');

Round.on('construct', function (m) {
  m.commit(new Commit(m.commit()));
  m.repos(m.repos().map(Repo));
});


var Level = plugins(model('Level'))
  .attr('rounds')
  .attr('level_no')
  .attr('type')
  .attr('mistakes')
  .attr('timer')
  ;

Level.on('construct', function (m) {
  m.rounds(m.rounds().map(Round));
});

// To override.
Level.prototype.getTimer = function (grade) {
  return this.timer();
};

Level.url = function (options) {
  var url = 'level';
  url += '/' + ROUNDS_PER_LEVEL[options.type] || 10;
  url += '/' + options.gradeLowerBound || 0;
  url += '/' + options.gradeUpperBound || 5;
  return url;
};

Level.getAvailableTypes = function (levelNo) {
  return LEVELS_PATH[levelNo];
};

Level.isValidType = function (type) {
  return LEVEL_TYPES.indexOf(type) === -1;
};

Level.create = function (levelDescriptor, data) {
  var rules = LEVEL_RULES[levelDescriptor.type][levelDescriptor.level_no];
  $.extend(data, rules, levelDescriptor);
  return new Level(data);
};

Level.getLevel = function (levelDescriptor, cb) {
  console.log('Level DEBUG getting level', levelDescriptor)
  var type = levelDescriptor.type;

  switch (type) {
    case 'bonus':
    // TODO: implement.
    case 'fast':
    case 'hard':
    case 'regular':
      var grade = LEVEL_DIFFICULTY[type];
      var url = Level.url({
        type: type,
        grade: grade
      });

      $.get(url, function (data) {
        cb(Level.create(levelDescriptor, data));
      });
    break;

    case 'final':
      var fastGrade = LEVEL_DIFFICULTY['fast'];
      var hardGrade = LEVEL_DIFFICULTY['hard'];
      $.when(
        $.get('level/10/' + fastGrade[0] + '/' + fastGrade[1]),
        $.get('level/10/' + hardGrade[0] + '/' + hardGrade[1])
      ).done(function (res1, res2) {
        var data = {
          rounds: res1[0].rounds.concat(res2[0].rounds)
        };
        data.level_no = levelDescriptor.level_no;
        var level = new Level(data);
        var nextIsHard = true;
        level.timer = function () {
          nextIsHard = !nextIsHard;
          var rules = LEVEL_RULES[nextIsHard ? 'hard' : 'fast'];
          var keys = Object.keys(rules);
          return rules[keys[Math.floor(Math.random() * keys.length)]].timer;
        };
        cb(level);
      });
    break;
    
    // 1 survival: infinite mode (3 mistakes before losing), random commits, timer by grade.
    case 'survival':
      var grade = LEVEL_DIFFICULTY['all'];
      $.get('level/1000/' + grade[0] + '/' + grade[1], function (data) {
        var rules = LEVEL_RULES[type][levelDescriptor.level_no];
        rules.level_no = levelDescriptor.level_no;
        $.extend(data, rules);
        var level = new Level(data);
        level.getTimer = function (grade) {
          console.log(grade)
          if (grade <= 25) {
            return 20;
          } else {
            return 30;
          }
        };
        cb(level);
      });
    break;

    default:
      throw new Error('Wrong level type ' + type);
    }
};

module.exports = Level
