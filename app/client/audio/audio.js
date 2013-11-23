var AudioPlayer = {};

// TODO: Add a way to turn off sound.

var FILES = {
  'click': '/audio/click.mp3',
  'timer-tick': '/audio/timer-tick.mp3',
  'timer-beep': '/audio/timer-beep-2.mp3',
  'coin-1': '/audio/coin-1.mp3',
  'coin-2': '/audio/coin-2.mp3',
  'coin-3': '/audio/coin-3.mp3',
  'miss': '/audio/miss.mp3',
  'guess': '/audio/guess.mp3',
  'achievement': '/audio/achievement.mp3',
  'defeat': '/audio/defeat.mp3',
  'end': '/audio/victory.mp3',  // TODO: Add survival-end sound.
  'victory': '/audio/victory.mp3',
  'flawless-victory': '/audio/flawless-victory.mp3',
  'power-time': '/audio/power-time.mp3',
  'power-commit': '/audio/power-commit.mp3',
  'power-half': '/audio/power-half.mp3',
  'power-repo': null,  // TODO: Add repo power sound.
};

var context;
var buffers;
var volumeController;
var initialized = false;

AudioPlayer.initialize = function () {
  if (!initialized) {
    context = new (window.AudioContext || window.webkitAudioContext)();
    buffers = {};
    for (var effectName in FILES) {
      AudioPlayer.loadSound(effectName);
    }
    volumeController = context.createGainNode();
    volumeController.connect(context.destination);
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

AudioPlayer.play = function (effectName, onEnd) {
  var buffer = buffers[effectName];
  if (buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(volumeController);
    if (onEnd) source.onended = onEnd;
    source.start(0);
  }
};

AudioPlayer.stopAllSounds = function () {
  volumeController.disconnect();
  var oldGain = volumeController.gain;
  volumeController = context.createGainNode();
  volumeController.gain = oldGain;
  volumeController.connect(context.destination);
};

AudioPlayer.initialize();

module.exports = AudioPlayer;
