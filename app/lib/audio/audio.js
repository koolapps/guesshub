var $ = require('jquery');
var howlerjs = require('howler.js');

var Howl = howlerjs.Howl;
var Howler = howlerjs.Howler;

var AudioPlayer = {};

var FILES = {
  'click': '/audio/click',
  'timer-tick': '/audio/timer-tick',
  'timer-beep': '/audio/timer-beep-2',
  'coin-1': '/audio/coin-1',
  'coin-2': '/audio/coin-2',
  'coin-3': '/audio/coin-3',
  'miss': '/audio/miss',
  'guess': '/audio/guess',
  'achievement': '/audio/achievement',
  'defeat': '/audio/defeat',
  'end': '/audio/end',
  'victory': '/audio/victory',
  'flawless-victory': '/audio/flawless-victory',
  'power-time': '/audio/power-time',
  'power-commit': '/audio/power-commit',
  'power-half': '/audio/power-half',
  'power-repo': '/audio/power-repo',
  'tutorial-tip': '/audio/click',
};

var context;
var buffers;
var volumeController;
var initialized = false;
var effects = {};

// Chrome is fine with mp3 but FF wants ogg and IE possibly wants .wav.
// Use http://media.io/ for converting.
function generateUrls(url) {
  return [url + '.mp3', url + '.ogg', url + '.wav'];
}

AudioPlayer.initialize = function ($toggle) {
  if (!initialized) {
    // Note: this needs to be ran on DomReady.
    $(function () {
      for (var effectName in FILES) {
        effects[effectName] = new Howl({
          urls: generateUrls(FILES[effectName])
        });
      }

      // Audio toggle.
      $toggle.on('click', function() {
        if (AudioPlayer.isEnabled()) {
          AudioPlayer.disable();
          $(this).attr({
            class: 'fa fa-volume-off',
            title: 'Unmute'
          });
          localStorage.setItem('audio', 'off');
        } else {
          AudioPlayer.enable();
          $(this).attr({
            class: 'fa fa-volume-up',
            title: 'Mute'
          });
          localStorage.setItem('audio', 'on');
        }
      });

      if (localStorage.getItem('audio') === 'off') {
        $toggle.click();
      }

      initialized = true;
    });
  }
};

AudioPlayer.play = function (effectName, onEnd) {
  if (!initialized) return;

  var effect = effects[effectName];
  if (effect) {
    effect.play();
  }
};

AudioPlayer.stopAllSounds = function () {
  for (var effectName in effects) {
    effects[effectName].stop();
  }
};

AudioPlayer.disable = function () {
  Howler.mute();
};

AudioPlayer.enable = function () {
  Howler.unmute();
};

AudioPlayer.isEnabled = function () {
  return Howler.volume() !== 0;
};

module.exports = AudioPlayer;
