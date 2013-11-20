var $ = require('jquery');
var Hogan = require('hogan.js');
var prism = require('prism');

var template = Hogan.compile(require('./template'));

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
  $el.toggleClass('hide', !show);
};

CommitDisplay.prototype.render = function() {
  var oldNum = this.model.old_start_line();
  var newNum = this.model.new_start_line();
  var model = this.model.toJSON();
  var code = [];

  model.diff_lines = this.model.diff_lines().split('\n').map(function (line) {
    var ret = {};
    ret.op = line[0];
    ret.content = line.slice(1);
    ret.cls = 'context';
    switch (ret.op) {
      case '+':
        ret.old_num = '&nbsp;';
        ret.new_num = ++newNum;
        ret.cls = 'ins';
        break;
      case '-':
        ret.old_num = ++oldNum;
        ret.new_num = '&nbsp;';
        ret.cls = 'del';
        break;
      case '\\':
        ret.content = '';
        break;
      case ' ':
        ret.old_num = ++oldNum;
        ret.new_num = ++newNum;
        break;
      default:
        ret.content = line;
    }
    if (ret.op !== '-' && ret.op !== '+') {
      ret.op = '&nbsp;';
      ret.cls = 'context';
    }
    code.push(ret.content);

    return ret;
  });

  // Syntax-highlight the code. Can't do that on the final DOM because it
  // includes line numbers and diff operators.
  var language = this._getCommitLanguage();
  var codeEl = $('<pre/>')
    .append('<code/>')
    .find('code')
    .addClass('language-' + language)
    .text(code.join('\n'))
    .get(0);

  prism.highlightElement(codeEl, false);
  $(codeEl).html().split('\n').forEach(function (highlightedLine, i) {
    model.diff_lines[i].content = highlightedLine;
  });

  this.$el = $(template.render(model));

  // By default, hide metadata.
  this.setVisibility({ metadata: false });
};

CommitDisplay.prototype._getCommitLanguage = function() {
  var ext = /\.([^.]+)$/.exec(this.model.filename());
  ext = (ext ? ext[1] : '').toLowerCase().trim();

  var lang = {
        ''                  : null,
        'c'                 : 'c',
        'h'                 : 'c',
        'cpp'               : 'cpp',
        'hpp'               : 'cpp',
        'cxx'               : 'cpp',
        'hxx'               : 'cpp',
        'cc'                : 'cpp',
        'vim'               : 'clike',
        'pbxproj'           : 'clike',
        'm'                 : 'clike',
        'go'                : 'clike',
        'coffee'            : 'coffeescript',
        'coffeescript'      : 'coffeescript',
        'litcoffee'         : 'coffeescript',
        'cs'                : 'csharp',
        'css'               : 'css',
        'less'              : 'css',
        'd'                 : 'd',
        'hs'                : 'haskell',
        'lhs'               : 'haskell',
        'html'              : 'html',
        'xml'               : 'markup',
        'java'              : 'java',
        'scala'             : 'java',
        'js'                : 'javascript',
        'json'              : 'javascript',
        'ts'                : 'javascript',
        'lua'               : 'lua',
        'php'               : 'php',
        'phtml'             : 'php',
        'py'                : 'python',
        'pyw'               : 'python',
        'r'                 : 'r',
        'rb'                : 'ruby',
        'scm'               : 'scheme',
        'sh'                : 'bash',
        'bash'              : 'bash',
        'zsh'               : 'bash',
        'sql'               : 'sql',
        'scss'              : 'scss',
        'groovy'            : 'groovy',
        'gvy'               : 'groovy',
        'gy'                : 'groovy',
        'gsh'               : 'gsh',
        'vsh'               : 'gsh',
        'fsh'               : 'gsh',
        'shader'            : 'gsh',
        'feature'           : 'gherkin'
  }[ext] || 'generic';
  console.log('CommitDisplay DEBUG: extension %s language %s', ext, lang);
  return lang;
};


module.exports = CommitDisplay;
