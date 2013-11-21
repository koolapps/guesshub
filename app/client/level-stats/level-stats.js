var $ = require('jquery');
var Hogan = require('hogan.js')
var template = Hogan.compile(require('./template'));

// TODO: Use a flashy animation on each change.

module.exports = function (levelProgress) {
  var $el = $('<div/>');

  function update (guessed) {
    $el.html(template.render(levelProgress));
  }
  levelProgress.on('change guessed', update.bind(null, true));
  levelProgress.on('change missed', update.bind(null, false));
  update();
  return $el;
};
