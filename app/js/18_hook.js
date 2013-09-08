
  // mixin for delegated events
  var hook = function (method) {
    return function () {
      return attach.apply(null, [method].concat(slice.call(arguments)));
    };
  };
