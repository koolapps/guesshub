var $ = require('jquery');
var template = require('./template');

module.exports = function (model) {
  var $el = $(template);

  $('.author', $el).text(model.author_login());
  $('.filename', $el).text(model.filename());
  // TODO: Hide metadata by default.
  // TODO: Add hooks to reveal parts of the metadata from within other modules.
  // TODO: Add author avatar.
  // TODO: Derive language from filename.
  // TODO: Add language icon.
  // TODO: Add syntax highlighting.

  var oldNum = model.old_start_line();
  var newNum = model.new_start_line();
  var lines = $.map(model.diff_lines().split('\n'), function(line) {
    var $oldNum = $('<span>').addClass('old-num').html('&nbsp;');
    var $newNum = $('<span>').addClass('new-num').html('&nbsp;');

    var op = line[0];
    var content = line.slice(1);
    var cls;
    if (op == ' ') {
      $oldNum.text(++oldNum);
      $newNum.text(++newNum);
      op = '&nbsp';
      cls = 'context';
    } else if (op == '+') {
      $newNum.text(++newNum);
      cls = 'ins';
    } else if (op == '-') {
      $oldNum.text(++oldNum);
      cls = 'del';
    } else if (op == '\\') {
      // A diff comment, such as "no new line at end of file".
      op = '&nbsp';
      cls = 'context';
      content = '';
    } else {
      throw new Error('Unknown diff operator: ' + line);
    }

    var $op = $('<span>').addClass('op').html(op);
    var $content = $('<span>').addClass('content').text(content);

    return $('<div>').addClass('line ' + cls)
        .append($oldNum).append($newNum).append($op).append($content);
  });
  $('.diff', $el).append(lines);

  return $el;
};
