var $ = require('jquery');
var reactive = require('reactive')
var template = require('./template');

module.exports = function ($el, model) {
  $el.append($(template));
  reactive($el[0], model);
}