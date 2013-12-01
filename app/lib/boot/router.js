var $ = require('jquery');
var Router = require('router');
var Campaign = require('models').Campaign;

var router = new Router();
var location = window.location;

var pushStateSupported = 'pushState' in window.history;

var prevPath = location.pathname;

exports.start = function (game) {
  if (!pushStateSupported) {
    return;
  }

  router.get('/', function () {
    game.showHub();
  });

  router.get('/level/:id', function (id) {
    id = parseInt(id, 10);
    game.showLevel(Campaign.MAIN.getLevelById(id));
  });

  $(window).on('popstate', function (e) {
    // Make sure it's not initial chrome popstate bug.
    if (e.originalEvent.state) {
      var dispatch = true;
      if (prevPath.match(/^\/level/)) {
        dispatch = confirm(
          'Are you sure you want to navigate away?\n' +
          'Level progress will be lost.'
        );
      }
      if (dispatch) {
        prevPath = location.pathname;
        router.dispatch(location.pathname);
      } else {
        exports.navigate(prevPath);
      }
    }
  });

  // Make sure it's not initial chrome popstate bug.
  window.history.replaceState({}, null, location.pathname);
};

exports.navigate = function (path) {
  if (pushStateSupported && path !== location.pathname) {
    prevPath = path;
    window.history.pushState({}, null, path);
  }
};

exports.dispatch = function () {
  if (pushStateSupported) {
    router.dispatch(location.pathname);
  }
};