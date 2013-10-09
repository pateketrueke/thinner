
  // exports magic
  var start = function (app) {
    // popstate events
    if (win.addEventListener) {
      win.addEventListener('popstate', popstate(app));
    } else if (win.attachEvent) {
      win.attachEvent('popstate', popstate(app));
    } else {
      win.onpopstate = popstate(app);
    }


    app.router.updateURL = function(path) {
      hist.pushState({ to: path }, doc.title, path);
    };

    app.router.replaceURL = function (path) {
      hist.replaceState({ to: path }, doc.title, path);
    };

    app.router.getHandler = function(name) {
      return broker(app, name);
    };

    app.router.redirectURL = function(path, update) {
      if (false !== update) {
        app.router.updateURL(path);
        app.history.push({ to: path });
      } else {
        app.router.replaceURL(path);
      }

      return app.router.handleURL(path);
    };
  };
