var $ = require('jquery');
var Hogan = require('hogan.js')
var template = Hogan.compile(require('./template'));

// TODO: Switch away from reactive.
// TODO: Merge guessed, missed and progress: /docs/progress-bar-mock.png.
// TODO: Add light gray plusses for each round still in queue.
// TODO: Use a flashy animation on each change.

module.exports = function (model) {
  var $el = $('<div/>', { class: 'level-meter-container' })
  function update () {
    $el.html(template.render(model.toJSON()));
    var percentComplete = model.completed_round() / model.rounds() * 100;
    $el.find('.inner-meter').css('width',  percentComplete + '%');
  }
  model.on('change', update);
  update();

  return $el;
};
