var $ = require('jquery');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

var POWER_TYPES = ['time', 'commit', 'repo', 'half'];
var POWER_PRICES = {
  time: 300,
  commit: 2000,
  repo: 5000,
  half: 42000
};
var POWER_TOOLTIPS = {
  time: 'Buy 25% of your time back!',
  commit: 'Reveal commit metadata!',
  repo: 'Reveal repository details!',
  half: 'Remove two wrong choices!'
};
var MAX_POWERS = 5;

// TODO: Resize icons to be the same size.
module.exports = function (user, mode, callback) {
  var $el = $('<div/>', { class: 'power-list' });
  function update() {
    $el.html(template.render({ powers: getPowers(user, mode) }));
  }
  user.on('change', update);
  update();

  // TODO: Make choices respond to QWER keyboards keys.
  $el.on('click', '.power', function () {
    var $this = $(this);
    if ($this.is('.available')) {
      (callback || $.noop)($this.attr('data-power-type'));
    }
  });

  return $el;
};

function getPowers(user, mode) {
  return POWER_TYPES.map(function (type) {
    // TODO: Make availability work for both buying and using mode.
    var tooltip = POWER_TOOLTIPS[type];
    var count = user.powers()[type] || 0;
    var is_available;
    var price_display;
    if (mode == 'buy') {
      var price = POWER_PRICES[type];
      var has_enough_score = user.score <= price;
      var is_full = count >= MAX_POWERS;
      is_available = has_enough_score && !is_full;
      price_display = is_full ? 'FULL' : price
    } else if (mode == 'use') {
      is_available = count > 0;
      price_display = null;
    } else {
      throw Error('Invalid mode: ' + mode + '. Must be "buy" or "use".');
    }
    return {
      type: type,
      price: price_display,
      count: count,
      available: is_available,
      tooltip: tooltip,
    };
  });
}