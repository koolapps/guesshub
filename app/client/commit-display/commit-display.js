var $ = require('jquery');
var Hogan = require('hogan.js');
var template = Hogan.compile(require('./template'));

// TODO: Add author avatar.
// TODO: Add syntax highlighting.
// TODO: Add block name.

function CommitDisplay (model) {
  this.model = model;
  this.render();
}

// @param options { filename: true/false, author: true/false, metadata: true/false }
CommitDisplay.prototype.setVisibility = function (options) {
  if (options.filename != null) {
    this._setElementVisibility(this.$el.find('.filename'), options.filename);
  }

  if (options.author != null) {
    this._setElementVisibility(this.$el.find('.author'), options.author);
  }

  if (options.metadata != null) {
    this._setElementVisibility(this.$el.find('.metadata'), options.metadata);
  }

};

CommitDisplay.prototype._setElementVisibility = function ($el, show) {
  method = show ? 'removeClass' : 'addClass';
  $el[method]('hide');
};

CommitDisplay.prototype.render = function() {
  var oldNum = this.model.old_start_line();
  var newNum = this.model.new_start_line();
  var model = this.model.toJSON();

  model.diff_lines = this.model.diff_lines().split('\n').map(function (line) {
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

  this.$el = $(template.render(model));
};


module.exports = CommitDisplay;
