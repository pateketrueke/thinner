
  // bind handlers
  var delegate = function (from, name) {
    var handler;

    handler = grow(from, new from.classes[name](from));
    handler.exit = dispose(from, name, handler.exit || undefined);

    return handler;
  };
