var $ = require('jquery');
var humanize = require('humanize-number');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

module.exports = function (user) {
  var $el = $('<div/>', { class: 'score-card-container' });
  function update () {
    $el.html(template.render({score: humanize(user.score())}));
  }
  user.on('change', update);
  update();
  return $el;
};
