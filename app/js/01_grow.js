
  // default hooks
  var grow = function (from, handler, is_plain) {
    if (! ('model' in handler)) {
      handler.model = proxy;
    }

    // delegate all event handlers
    if ('object' === typeof handler.events) {
      handler.events = handle(handler, handler.events);
    }

    handler.events = handler.events || {};
    handler.events.error = raise(from, handler.events.error || undefined);

    // backward compatibility
    if (is_plain) {
      handler = handle(from.context, handler);
    }

    return handler;
  };
