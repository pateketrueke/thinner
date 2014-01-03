
// exports magic
var start = function(app) {
  var win, doc, hist;

  if ('undefined' !== typeof window) {
    win = window;
    hist = window.history;
    doc = window.document;
  }

  win = settings.context.window || win || {};
  doc = settings.context.document || doc || {};
  hist = settings.context.history || hist || {};

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
      if (hist.pushState) {
        hist.pushState({ to: path }, doc.title, path);
      }
    },

    replaceURL: function(path) {
      if (hist.replaceState) {
        hist.replaceState({ to: path }, doc.title, path);
      }
    },

    getHandler: function(name) {
      var handler = broker(app, name);

      // TODO: extract settings from handler
      bind(settings.el, settings.listen);

      return handler;
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
