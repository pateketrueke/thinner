
  // reactive views
  var view = function (from, name, handler) {
    var key;

    // lazy loading
    handler.partials = [];

    for (key in from.classes[name]) {
      if (key in handler) {
        throw new Error('<' + partials[length] + '> already defined!');
      }

      handler[key] = lazy(from, name, key);
      handler.partials.push(key);
    }
  };
