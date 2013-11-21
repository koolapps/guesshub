var $ = require('jquery');
var template = require('./template');

module.exports = function (levelProgress) {
  var $el = $('<div/>', { class: 'hearts' });

  function update (mistakesLeft) {
    console.log(mistakesLeft)
    $el.empty();
    while (mistakesLeft-- > 0) {
      $el.append(template);
    }
  }

  levelProgress.on('change mistakes_left', update);
  update(levelProgress.mistakes_left());

  return $el;
};
