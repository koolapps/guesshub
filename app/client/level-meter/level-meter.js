var $ = require('jquery');
var template = require('./template');

// TODO: Add light gray plusses for each round still in queue.
// TODO: Use a flashy animation on each change.

module.exports = function (levelProgress) {
  var $el = $(template);
  var $innerMeter = $('<div/>', { class: 'inner-meter' });
  var $outerMeter = $el.find('.outer-meter');
  var totalRounds = levelProgress.rounds();
  var partHeight = 100 / totalRounds;

  function update (guessed) {
    var $part = $innerMeter
      .clone()
      .css('height', partHeight + '%')
      .addClass(guessed ? 'guessed' : 'missed');

    $outerMeter.append($part);

    // Make sure we don't have any empty space at the edge.
    if (levelProgress.completed_round() === levelProgress.rounds()) {
      $outerMeter.height($el.find('.inner-meter').height() * totalRounds);
    }
  }
  levelProgress.on('change guessed', update.bind(null, true));
  levelProgress.on('change missed', update.bind(null, false));

  return $el;
};
