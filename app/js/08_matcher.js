
  // setup routing
  var matcher = function (app) {
    var self = this;

    return function (fn) {
      var handler,
          handlers;

      app.router.map(function(match) {
        handlers = fn.apply(self, [match]);
        handlers = 'function' !== typeof handlers.to && handlers;
      });


      // backward compatibility
      if (handlers && 'object' === typeof handlers) {
        for (handler in handlers) {
          app.handlers[handler] = handlers[handler];
        }
      }
    };
  };
