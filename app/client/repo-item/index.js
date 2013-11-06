var $ = require('jquery');
var reactive = require('reactive');
var template = require('./template')

module.exports = function (model) {
  var view = reactive($(template)[0], model);
  return view.el;
}
