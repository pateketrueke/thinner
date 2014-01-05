
// nice routing
var transform = function(app, routes) {
  var expand, map;

  expand = function(handler, params) {
    return function(match) {
      var route;

      if (!params.routes) {
        route = match(params.path).to(handler);
      } else {
        route = match(params.path).to(handler, map(params.routes));
      }

      if (params.params) {
        route.withQueryParams.apply(route, params.params);
      }

      app.classes[handler] = params.handler(app);
    };
  };

  map = function(handlers) {
    return function(match) {
      var handler;

      for (handler in handlers) {
        if ('object' === typeof handlers[handler]) {
          expand(handler, handlers[handler])(match);
        }
      }
    };
  };

  app.router.map(map(routes));
};
