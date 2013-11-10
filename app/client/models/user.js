var model = require('model');
var plugins = require('./plugins');

var User = plugins(model('User'))
  .attr('score', { default: 0 });

User.prototype.addScore = function (commit, secondsTaken) {
  // Assuming grade is between 0 and 50 we rescale to 50 - 100
  var grade = commit.grade() * 2;
  this.score(
    this.score() + Math.round(grade / Math.sqrt(1 + secondsTaken))
  );
};

module.exports = User;
