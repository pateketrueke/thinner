
  // bind handlers
  var delegate = function (from, name) {
    var handler;

    handler = new from.classes[name](from);

    grow(from, handler);
    view(from, name, handler);

    handler.exit = dispose(from, name, handler.exit || undefined);

    return handler;
  };
