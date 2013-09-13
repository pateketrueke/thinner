
  // exports magic
  var start = function () {
    var App = {},
        self = create(App),
        module, events, evt;

    // load modules
    for (module in modules) {
      modules[module].apply(self.context, [App]);
    }

    // popstate events
    if (win.addEventListener) {
      win.addEventListener('popstate', popstate(self));
    } else if (win.attachEvent) {
      win.attachEvent('popstate', popstate(self));
    } else {
      win.onpopstate = popstate(self);
    }

    // listen all events
    events = 'string' === typeof settings.listen ? settings.listen.split(' ') : settings.listen;

    while (evt = events.pop()) {
      observe(self, evt);
    }


    self.router.updateURL = function(path) {
      hist.pushState({ to: path }, doc.title, path);
    };

    self.router.replaceURL = function (path) {
      hist.replaceState({ to: path }, doc.title, path);
    };

    self.router.getHandler = function(name) {
      return broker(self, name);
    };

    self.router.redirectURL = function(path, update) {
      if (false !== update) {
        self.router.updateURL(path);
        self.context.history.push({ to: path });
      } else {
        self.router.replaceURL(path);
      }

      return self.router.handleURL(path);
    };

    return self;
  };
