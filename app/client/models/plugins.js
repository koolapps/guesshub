var clone = require('clone');
var defaults = require('model-defaults');

module.exports = function (Model) {
  return Model
    .use(function (m) {
      m.prototype.toJSON = function () {
        return clone(this.attrs);
      };
    })
    .use(defaults)
    ;
}