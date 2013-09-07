
  // event manager
  var observe = function (app, handler) {
    var evt;

    current = handler;

    // listen all events
    while (evt = events.pop()) {
      attach.apply(app, [evt.toLowerCase(), evt]);
    }
  };
