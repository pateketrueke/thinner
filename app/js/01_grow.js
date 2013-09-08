
  // default hooks
  var grow = function (from, handler, is_plain) {
    if (! ('model' in handler)) {
      handler.model = proxy;
    }

    if ('function' === typeof handler.actions) {
      observe(from, handler);
    }


    // delegate all event handlers
    if ('object' === typeof handler.events) {
      handler.events = handle(handler, handler.events);
    }

    // backward compatibility
    if (is_plain) {
      handler = handle(from.context, handler);
    }

    return handler;
  };
