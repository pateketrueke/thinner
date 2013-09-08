
  // mixin for delegate handlers
  var handle = function (self, mixin) {
    var length = methods.length,
        subkey,
        key;

    // loop all
    if ('object' === typeof mixin) {
      while (length--) {
        key = methods[length];

        if (key in mixin) {
          if ('function' === typeof mixin[key]) {
            mixin[key] = handle(self, mixin[key]);
          } else {
            // up to one-level depth
            for (subkey in mixin[key]) {
              if ('function' === typeof mixin[key][subkey]) {
                mixin[key][subkey] = handle(self, mixin[key][subkey]);
              }
            }
          }
        }
      }
    } else if ('function' === typeof mixin) {
      return function () { return mixin.apply(self, arguments); };
    }

    return mixin;
  };
