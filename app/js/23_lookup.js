
  // retrieve container
  var lookup = function () {
    var keys = slice.call(arguments),
        root = keys.shift(),
        retval;

    if (this[root]) {
      retval = this[root];
    }

    return keys.length ? lookup.apply(retval, keys) : retval;
  };
