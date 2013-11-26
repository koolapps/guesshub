var $ = require('jquery');
var humanize = require('humanize-number');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

module.exports = function (score) {
  return $('<div/>', { class: 'score-card-container' })
      .html(template.render({score: humanize(score)}));
};
