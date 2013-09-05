
  // mixin for delegate handlers
  var handle = function (self, mixin) {
    var key,
        out = {};

    if ('function' === typeof mixin) {
      return function () { return mixin.apply(self, arguments); };
    }

    if ('object' === typeof mixin) {
      for (key in mixin) {
        out[key] = handle(self, mixin[key]);
      }
    }

    return out;
  };
