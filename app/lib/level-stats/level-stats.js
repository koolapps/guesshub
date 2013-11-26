var $ = require('jquery');
var Hogan = require('hogan.js')
var template = Hogan.compile(require('./template'));

// TODO: Use a flashy animation on each change.

module.exports = function (levelProgress) {
  return $('<div/>')
      .html(template.render({
        remaining: levelProgress.completed_round(),
        total: levelProgress.rounds()
      }));
};
