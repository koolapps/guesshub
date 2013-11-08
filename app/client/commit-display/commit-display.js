var $ = require('jquery');
var reactive = require('reactive')
var template = require('./template');

module.exports = function (model) {
  var $el = $(template);
  reactive($el[0], model);
  return $el;
};
