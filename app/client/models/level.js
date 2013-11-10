var model = require('model');
var Repo = require('./repo');
var Commit = require('./commit');
var plugins = require('./plugins');

var Level = plugins(model('Level'))
  .attr('rounds')
  .attr('level_no');

var Round = plugins(model('Round'))
  .attr('commit')
  .attr('repos');

Round.on('construct', function (m) {
  m.commit(new Commit(m.commit()));
  m.repos(m.repos().map(Repo));
});

Level.prototype.getRound = function (r) {
  return new Round(this.rounds()[r]);
};

module.exports = Level
