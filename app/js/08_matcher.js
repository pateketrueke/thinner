
  // setup routing
  var matcher = function (app) {
    var self = this;

    return function (fn) {
      var handler,
          handlers;

      app.router.map(function(match) {
        handlers = fn.call(self, match);
        handlers = 'function' !== typeof handlers.to && handlers;
      });
    };
  };
