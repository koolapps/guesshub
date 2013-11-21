var $ = require('jquery');
var humanize = require('humanize-number');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

module.exports = function (user) {
  var $el = $('<div/>', { class: 'score-card-container columns' });
  function update () {
    $el.html(template.render({score: humanize(user.score())}));
    // var $icon = $('img.g', $el);
    // resize($el, 100, 16, 36, 0.25, function(fontSize) {
    //   var iconSize = fontSize * 0.75;
    //   $icon.css('width', iconSize);
    //   $icon.css('top', iconSize / 14);
    // });
  }
  user.on('change', update);
  update();
  return $el;
};

// // TODO: Factor out into a component.
// function resize($el, desiredWidth, min, max, step, cb) {
//   if (!$.contains(document.documentElement, $el[0])) {
//     // Wait until inserted.
//     // TODO: Avoid this hack.
//     setTimeout(resize.bind(null, $el, desiredWidth, min, max, step, cb), 50);
//     return;
//   }

//   step = step || 1;
//   cb = cb || $.noop;

//   var size = parseInt($el.css('font-size')) || ((min + max) / 2);
//   var maxAdjustments = 500;  // Safety catch.
//   var lastDirection = 0;
//   for (var i = 0; i < maxAdjustments; i++) {
//     var width = $el.width();
//     if (width < desiredWidth && lastDirection != -1 && size < max) {
//       size = size + step;
//       lastDirection = 1;
//     } else if (width > desiredWidth && lastDirection != 1 && size > min) {
//       size = size - step;
//       lastDirection = -1;
//     } else if (i != 0) {
//       // Can't get better.
//       break;
//     }
//     $el.css('font-size', size);
//     cb(size);
//   }
// }
