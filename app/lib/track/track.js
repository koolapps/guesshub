var $ = require('jquery');

var Track = {};

Track.initialize = function () {
  window.GoogleAnalyticsObject = 'ga';
  window.ga = function () {
    window.ga.q.push(arguments);
  }
  window.ga.q = [];
  window.ga.l = Date.now();

  $.getScript('//www.google-analytics.com/analytics.js');

  ga('create', 'UA-46058020-1', 'guesshub.io');
};

Track.visit = function () {
  ga('send', 'pageview');
};

Track.event = function (category, action, label, value) {
  ga('send', 'event', category, action, label, value);
};

module.exports = Track;

// Events tracked so far:
// level <win/lose/flawless/end> <level-id>
// power <buy/use> <type>
// score <earn> <level-id> <value>
// round <guess/miss/timeout> <level-id> <time-taken>
