
// mixin for grown-up handlers
var handle = function(self, mixin) {
  var key;

  // loop all methods
  if ('object' === typeof mixin) {
    for (key in mixin) {
      if ('function' === typeof mixin[key]) {
        mixin[key] = handle(self, mixin[key]);
      }
    }
  } else if ('function' === typeof mixin) {
    return function() { return mixin.apply(self, arguments); };
  }

  return mixin;
};
