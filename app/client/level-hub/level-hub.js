var $ = require('jquery');
var audio = require('audio');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));
var levelTemplate = Hogan.compile(require('./level-template'));

// Renders the level hub for a given campaign, calling back when a level is
// selected passing the Level object.
module.exports = function (campaign, user, callback) {
  var $el = $('<div/>', { class: 'level-hub' });
  $el.html(
    template.render(
      campaign.toJSONWithUserProgress(user), { levelTemplate: levelTemplate }
    )
  );

  $el.on('click', '.level', function () {
    var id = parseInt($(this).data('id'), 10);
    if (campaign.isUnlocked(id, user.completed_level_ids())) {
      callback(campaign.getLevelById(id));
    }
  }).on('mouseenter', '.level.unlocked', function () {
    audio.play('click');
  });

  return $el;
};
