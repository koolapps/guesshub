var $ = require('jquery');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

// Renders the level hub for a given campaign, calling back when a level is
// selected passing the Level object.
// TODO: Support locked/unlocked levels.
module.exports = function (campaign, callback) {
  var $el = $('<div/>', { class: 'level-hub' });
  $el.html(template.render(campaign.toJSON()));

  $el.on('click', '.level', function () {
    callback(campaign.getByName($(this).text()));
  });

  return $el;
};
