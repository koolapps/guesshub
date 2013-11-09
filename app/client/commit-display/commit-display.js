var $ = require('jquery');
var template = require('./template');
var Hogan = require('hogan.js');


// TODO: Hide all metadata by default.
// TODO: Add hooks to reveal parts of the metadata from within other modules.
// TODO: Add author avatar.
// TODO: Derive language from filename.
// TODO: Add language icon.
// TODO: Add syntax highlighting.
// TODO: Add block name.

module.exports = function (model) {
  template = Hogan.compile(template);

  var oldNum = model.old_start_line();
  var newNum = model.new_start_line();
  var lines = model.diff_lines().split('\n').map(function (line) {
    var ret = {};
    ret.op = line[0];
    ret.content = line.slice(1);
    ret.cls = 'context';
    switch (ret.op) {
      case '+':
        ret.new_num = ++newNum;
        ret.old_num = '&nbsp;';
        ret.cls = 'ins';
        break;
      case '-':
        ret.old_num = ++oldNum;
        ret.new_num = '&nbsp;';
        ret.cls = 'del';
        break;
      case '\\':
        content = '';
        break;
      case ' ':
        ret.new_num = ++newNum;
        ret.old_num = ++oldNum;
        break;
      default:
        ret.content = line;
      }
      if (ret.op !== '-' && ret.op !== '+') {
        ret.op = '&nbsp;';
        ret.cls = 'context';
      }
      return ret;
  });
  model = model.toJSON();
  model.diff_lines = lines;
  console.log(model)
  return $(template.render(model));
};
