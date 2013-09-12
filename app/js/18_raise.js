
  // event-error delegation
  var raise = function (app, fn) {
    var self = this;

    return function () {
      var args = arguments;

      return error(app, function (e) {
        return 'function' === typeof fn && fn.apply(self, args);
      });
    };
  };
