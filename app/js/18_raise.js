
  // event-error delegation
  var raise = function (app, fn) {
    return function (err, transition) {
      return error(app, function () {
        throw 'function' === typeof fn && fn(err, transition) || transition;
      });
    };
  };
