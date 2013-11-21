
  // exports magic
  var start = function (app) {
    var win = settings.context['window'] || window,
        doc = settings.context['document'] || document,
        hist = settings.context['history'] || window.history;

    // popstate events
    if (win.addEventListener) {
      win.addEventListener('popstate', popstate(app));
    } else if (win.attachEvent) {
      win.attachEvent('popstate', popstate(app));
    } else {
      win.onpopstate = popstate(app);
    }


    // helpers
    extend(app.router, {
      log: debug,

      updateURL: function(path) {
        hist && hist.pushState({ to: path }, doc.title, path);
      },

      replaceURL: function (path) {
        hist && hist.replaceState({ to: path }, doc.title, path);
      },

      getHandler: function(name) {
        return broker(app, name);
      },

      redirectURL: function(path, update) {
        if (false !== update) {
          app.router.updateURL(path);
          app.history.push({ to: path });
        } else {
          app.router.replaceURL(path);
        }

        return app.router.handleURL(path);
      }
    });
  };
