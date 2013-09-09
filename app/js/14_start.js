
  // exports magic
  var start = function () {
    var App = {},
        self = mohawk(App),
        router = new Router(),
        module, evt;

    // router.js
    self.router = router;

    // load modules
    for (module in modules) {
      modules[module].apply(self.context, [App]);
    }

    // attach events
    if (win.addEventListener) {
      win.addEventListener('popstate', popstate(self));
    } else if (win.attachEvent) {
      win.attachEvent('popstate', popstate(self));
    } else {
      win.onpopstate = popstate(self);
    }

    // listen all events
    while (evt = events.pop()) {
      observe(evt);
    }


    router.updateURL = function(path, query) {
      hist.pushState({ to: path, q: query }, doc.title, path + (query ? '?' + query : ''));
    };

    router.getHandler = function(name) {
      current = broker(self, name);

      return current;
    };

    router.redirectURL = function(path, update, locals) {
      if (undefined !== locals) {
        if ('object' === typeof locals) {
          // TODO: use something like http_build_query()
          throw new Error('Not implemented yet!');
        } else {
          locals = String(locals);
        }
      }

      if (false !== update) {
        router.updateURL(path, locals || null);
        self.context.history.push({ to: path, q: locals });
      } else {
        hist.replaceState({ to: path, q: locals }, doc.title, path + (locals ? '?' + locals : ''));
      }

      return router.handleURL(path);
    };

    return self;
  };
