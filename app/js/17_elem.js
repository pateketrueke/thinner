
  // CSS selector/DOM utility
  var elem = function () {
    var $;

    if (! ($ = global.Zepto || global.jQuery || global.$)) {
      throw new Error('jQuery-compatible library is required!');
    }

    return $.apply($, arguments);
  };
