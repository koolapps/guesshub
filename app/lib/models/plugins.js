var $ = require('jquery');
var defaults = require('model-defaults');

/** Patches Model.toJSON() to clone the object and recurse into arrays. */
module.exports = function (Model) {
  return Model
    .use(function (m) {
      m.prototype.toJSON = function () {
        return toJSON(this);
      };
    })
    .use(defaults)
    ;
}

function toJSON(val) {
  if (val && val.toJSON && val.attrs) {
    var result = {};
    for (var key in val.attrs) {
      result[key] = toJSON(val.attrs[key]);
    }
    return result;
  } else if (val instanceof Array) {
    return $.map(val, toJSON);
  } else {
    return val;
  }
}
