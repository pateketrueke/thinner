
  // remove handlers
  var dispose = function (from, name, fn) {
    return function () {
      var retval = 'function' === typeof fn ? fn.apply(null, arguments) : undefined;

      // only if can be created again
      delete from.handlers[name];

      return retval;
    };
  };
