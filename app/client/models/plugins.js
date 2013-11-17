var clone = require('clone');
var defaults = require('model-defaults');

/** Patches Model to clone object in toJSON(). */
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