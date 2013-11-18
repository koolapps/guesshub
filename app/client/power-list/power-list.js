var $ = require('jquery');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));


// TODO: Resize icons to be the same size.
module.exports = function (powers, user, mode, callback) {
  var $el = $('<div/>', { class: 'power-list' });
  function update() {
    $el.html(template.render({ powers: getPowers(powers, user, mode) }));
  }
  user.on('change', update);
  update();

  // TODO: Make choices respond to QWER keyboards keys.
  $el.on('click', '.power', function () {
    var $this = $(this);
    if ($this.is('.available')) {
      (callback || $.noop)(powers[$this.attr('data-power-type')]);
    }
  });

  return $el;
};

function getPowers(powers, user, mode) {
  return $.map(powers, function (power) {
    var isAvailable, priceDisplay;
    if (mode == 'buy') {
      var canStore = user.canStorePower(power);
      isAvailable = user.canAffordPower(power) && canStore;
      priceDisplay = canStore ? power.price() : 'FULL';
    } else if (mode == 'use') {
      isAvailable = user.canUsePower(power);
      priceDisplay = null;
    } else {
      throw Error('Invalid mode: ' + mode + '. Must be "buy" or "use".');
    }
    return {
      type: power.id(),
      tooltip: power.tooltip(),
      count: user.powerCount(power),
      available: isAvailable,
      price: priceDisplay
    };
  });
}