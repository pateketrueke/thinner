
  // nice handlers
  var camelize = function (str) {
    return str.replace(/[._-][a-z]/g, function ($0) { return $0.substr(1).toUpperCase(); });
  };


  // mixin for passing params
  var proxy = function (params) { return params; };


  // safe arrays
  var slice = Array.prototype.slice;


  // object length
  var count = function (set) {
    var index,
        length = 0;

    for (index in set) {
      length += parseInt(set.hasOwnProperty(index), 10);
    }

    return length;
  };


  // CSS selector/DOM utility
  var elem = function () {
    var $;

    if (! ($ = global.Zepto || global.jQuery || global.$)) {
      throw new Error('jQuery-compatible library is required!');
    }

    if (! arguments.length) {
      return $;
    }

    return $.apply($, arguments);
  };
