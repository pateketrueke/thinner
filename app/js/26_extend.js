
  // basic extends
  var extend = function (self, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        self[key] = source[key];
      }
    }
  };
