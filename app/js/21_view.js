
  // reactive views
  var view = function (from, name, handler) {
    var key,
        klass = from.classes[name];

    // lazy loading
    handler.partials = [];

    for (key in klass) {
      if (klass.hasOwnProperty(key) && key.charAt(0) !== '_') {
        if (key in handler) {
          throw new Error('<' + partials[length] + '> already defined!');
        }

        handler[key] = lazy(from, name, key);
        handler.partials.push(key);
      }
    }
  };
