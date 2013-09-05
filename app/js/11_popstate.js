
  // handle url changes
  var popstate = function (app) {
    return function (e) {
      if (e.state && e.state.to) {
        app.router.handleURL(e.state.to);
      }
    };
  };
