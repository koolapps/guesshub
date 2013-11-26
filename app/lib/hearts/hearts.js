var $ = require('jquery');
var template = require('./template');
var animate = require('animate');

module.exports = function (levelProgress) {
  var $el = $('<div/>', { class: 'hearts' });

  function update (mistakesLeft) {
    if (mistakesLeft < 0) {
      return;
    }
    var hearts = $el.find('.fa-heart').toArray();
    if (hearts.length < mistakesLeft) {
      while (mistakesLeft-- > 0) {
        $el.append(template);
      }
    } else {
      while (hearts.length > mistakesLeft) {
        var heart = hearts.pop();
        animate.out(heart, 'rotate-up-right', false, function () {
          $(heart).css('visibility', 'hidden');
        });
      }
    }
  }

  levelProgress.on('change mistakes_left', update);
  update(levelProgress.mistakes_left());

  return $el;
};
