
  // default hooks
  var grow = function (from, handler) {
    if (! ('model' in handler)) {
      handler.model = proxy;
    }

    if ('function' === typeof handler.actions) {
      observe(from, handler);
    }

    return handle(from.context, handler);
  };
