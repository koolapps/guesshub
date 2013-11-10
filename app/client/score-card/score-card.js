var $ = require('jquery');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

module.exports = function (model) {
  var $el = $('<div/>', { class: 'score-card-container' });
  function update () {
    console.log(model)
    $el.html(template.render(model.toJSON()));
  }
  model.on('change', update);
  update();
  return $el;
}