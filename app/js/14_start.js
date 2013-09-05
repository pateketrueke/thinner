
  // exports magic
  var start = function () {
    var App = {},
        self = new Bind(App),
        router = new Router(),
        module;

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


    router.updateURL = function(path, query) {
      if (history && history.pushState) {
        history.pushState({ to: path, q: query }, doc.title, path + (query ? '?' + query : ''));
      }
    };

    router.getHandler = function(name) {
      return broker(self, name);
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
        self.history.push({ to: path, q: locals });
      } else if (history && history.replaceState) {
        history.replaceState({ to: path, q: locals }, doc.title, path + (locals ? '?' + locals : ''));
      }

      return router.handleURL(path);
    };

    return self;
  };
