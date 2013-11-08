var $ = require('jquery');
var reactive = require('reactive');
var template = require('./template')

// TODO: Add hover and click sounds.
module.exports = function (model) {
  var view = reactive($(template)[0], model);
  return view.el;
}
