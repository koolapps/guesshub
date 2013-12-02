var $ = require('jquery');

module.exports = function () {
  var inMenu = false;

  $('.social-media').mouseenter(function () {
    inMenu = true;
  }).mouseleave(function () {
    inMenu = false;
    $('.social-media').removeClass('show');
  });

  $('.share-menu-button').on('mouseenter click', function () {
    $('.social-media').addClass('show');
  }).mouseleave(function () {
    setTimeout(function () {
      if (!inMenu) {
        $('.social-media').removeClass('show').addClass('hide');
      }
    }, 300);
  });

};