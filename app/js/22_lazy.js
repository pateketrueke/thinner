
  // lazy objects
  var lazy = function (from, name, partial) {
    var obj;

    return function () {
      if (! obj) {
        obj = new from.classes[name][partial](from);
        obj.view = new Ractive(obj.view || {}); // TODO: defaults
        obj.setup();
      }

      return obj;
    };
  };

