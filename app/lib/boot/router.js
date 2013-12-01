var $ = require('jquery');
var Router = require('router');
var Campaign = require('models').Campaign;

var router = new Router();
var location = window.location;

var pushStateSupported = 'pushState' in window.history;

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
      router.dispatch(location.pathname);
    }
  });

  // Make sure it's not initial chrome popstate bug.
  window.history.replaceState({}, null, location.pathname);
};

exports.navigate = function (path) {
  if (pushStateSupported && path !== location.pathname) {
    window.history.pushState({}, null, path);
  }
};

exports.dispatch = function () {
  if (pushStateSupported) {
    router.dispatch(location.pathname);
  }
};