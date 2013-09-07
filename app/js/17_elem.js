
  // CSS selector/DOM utility
  var elem = global.Zepto || global.jQuery || global.$ || function () {
    throw new Error('jQuery-compatible library is required!');
  };
