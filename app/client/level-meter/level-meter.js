var $ = require('jquery');
var template = require('./template');

// TODO: Add light gray plusses for each round still in queue.
// TODO: Use a flashy animation on each change.

module.exports = function (model) {
  var $el = $(template);
  var $innerMeter = $('<div/>', { class: 'inner-meter' });
  var $outerMeter = $el.find('.outer-meter');
  var partWidth = 100 / model.rounds();

  function update (guessed) {
    var $part = $innerMeter
      .clone()
      .css('width', partWidth + '%')
      .addClass(guessed ? 'guessed' : 'missed')
      .append($('<span/>').text(guessed ? '+' : '–'));

    $outerMeter.append($part);

    // Make sure we don't have any empty space at the edge.
    if (model.completed_round() === model.rounds()) {
      $outerMeter.width($el.find('.inner-meter').width() * model.rounds());
    }
  }
  model.on('change guessed', update.bind(null, true));
  model.on('change missed', update.bind(null, false));

  return $el;
};
