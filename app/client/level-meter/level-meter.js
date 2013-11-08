var reactive = require('reactive');
var template = require('./template');
var $        = require('jquery');

// Make it work with component/models
reactive.get(function (obj, prop) {
  return obj.get(prop);
});
reactive.set(function (obj, prop, val) {
  return obj.set(prop, val);
});

// TODO: Switch away from reactive.
// TODO: Merge guessed, missed and progress: /docs/progress-bar-mock.png.
// TODO: Use a flashy animation on each change.
module.exports = function (model) {
  var $el = $(template);
  var view = reactive($el[0], model);

  view.bind('percent-complete', function (el) {
    function update (rounds) {
      var percentComplete = rounds / model.rounds() * 100;
      $(el).css('width',  percentComplete + '%');
    }
    model.on('change completed_round', update);
    update(model.completed_round());
  });

  return $el[0];
};
