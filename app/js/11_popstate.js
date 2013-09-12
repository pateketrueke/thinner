
  // handle url changes
  var popstate = function (app) {
    return function (e) {
      return error(app, function () {
        if (e.state && e.state.to) {
          app.router.handleURL(e.state.to + (e.state.q ? '?' + e.state.q : ''));
        }
      });
    };
  };
