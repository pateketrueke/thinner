
  // default hooks
  var grow = function (from, handler) {
    if (! ('model' in handler)) {
      handler.model = proxy;
    }

    return handle(from.context, handler);
  };
