var AudioPlayer = {};

var FILES = {
  'timer-tick': '/audio/timer-tick.mp3',
  'timer-beep': '/audio/timer-beep.mp3',
};

var context;
var buffers;
var initialized = false;

AudioPlayer.initialize = function () {
  if (!initialized) {
    context = new (window.AudioContext || window.webkitAudioContext)();
    buffers = {};
    for (var effectName in FILES) {
      AudioPlayer.loadSound(effectName);
    }
    initialized = true;
  }
};

AudioPlayer.loadSound = function (effectName) {
  var filename = FILES[effectName];
  if (filename) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', filename, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      if (xhr.status == 200) {
        context.decodeAudioData(xhr.response, function(buffer) {
          buffers[effectName] = buffer;
        });
      }
    };
    xhr.send();
  }
};

AudioPlayer.play = function (effectName) {
  var buffer = buffers[effectName];
  if (buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  }
};

AudioPlayer.initialize();

module.exports = AudioPlayer;
