(function (undefined) {
  'use strict';

  // shortcuts
  var Mohawk = {},

      win = this.window,
      doc = this.document,
      history = win.history,
      popevents = [],
      modules = {},
      exception;


  // default hooks
  var grow = function (from, handler) {
    if (! ('model' in handler)) {
      handler.model = proxy;
    }

    return handle(from.context, handler);
  };


  // nice handlers
  var camelize = function (str) {
    return str.replace(/([._-][a-z])/g, function ($1) { return $1.substr(1).toUpperCase(); });
  };


  // remove handlers
  var dispose = function (from, name, fn) {
    return function () {
      var retval = 'function' === typeof fn ? fn.apply(null, arguments) : undefined;

      // only if can be created again
      delete from.handlers[name];

      return retval;
    };
  };


  // bind handlers
  var delegate = function (from, name) {
    var handler;

    handler = grow(from, new from.classes[name](from));
    handler.exit = dispose(from, name, handler.exit || undefined);

    return handler;
  };


  // object length
  var count = function (set) {
    var index,
        length = 0;

    for (index in set) {
      length += parseInt(set.hasOwnProperty(index), 10);
    }

    return length;
  };


  // mixin for passing params
  var proxy = function (params) { return params; };


  // mixin for delegate handlers
  var handle = function (self, mixin) {
    var key,
        out = {};

    if ('function' === typeof mixin) {
      return function () { return mixin.apply(self, arguments); };
    }

    for (key in mixin) {
      out[key] = handle(self, mixin[key]);
    }

    return out;
  };


  // setup routing
  var matcher = function (app) {
    return function (fn) {
      var handler,
          handlers,
          self = this;

      app.router.map(function(match) {
        handlers = fn.apply(self, [match]);
      });


      // backward compatibility
      if (handlers && 'object' === typeof handlers) {
        for (handler in handlers) {
          app.handlers[handler] = handlers[handler];
        }
      }
    };
  };


  // normalize arguments for url()
  var url_params = function (app, path, params, update) {
    if ('boolean' === typeof params) {
      update = params;
      params = undefined;
    }

    if (String(path).charAt(0) !== '/') {
      path = app.context.url(path, params || {});
    }

    update = params && params.update || update;
    update = null == update ? true : update;

    return [path, params || {}, update];
  };


  // main module loader
  var initialize = function (app, modules) {
    var module,
        klass;

    for (module in modules) {
      if ('function' !== typeof modules[module]) {
        throw new Error('<' + ('string' === typeof module ? module : modules[module]) + '> is not a module!');
      }

      klass = String(modules[module]);
      klass = /function\s(.+?)\b/.exec(klass)[1] || undefined;

      module = new modules[module](app);

      if (! module.initialize_module || 'function' !== typeof module.initialize_module) {
        throw new Error('<' + klass + '#initialize_module> is missing!');
      }

      if (app.modules[klass]) {
        throw new Error('<' + klass + '> module already loaded!');
      }

      app.context.send(module.initialize_module, { draw: matcher(app) });
      app.modules[klass] = module;
    }
  };


  // handle url changes
  var popstate = function (e) {
    var app,
        index = popevents.length;

    if (e.state && e.state.to) {
      while (index) {
        index -= 1;

        app = popevents[index];
        app.context.go(e.state.to, false);
      }
    }
  };


  // all url changes
  if (win.addEventListener) {
    win.addEventListener('popstate', popstate);
  } else if (win.attachEvent) {
    win.attachEvent('popstate', popstate);
  } else {
    win.onpopstate = popstate;
  }


  // cached objects
  Mohawk.broker = function (app, name) {
    var klass = camelize(name);

    // backward compatibility
    if (app.handlers[name]) {
      if ('function' === typeof app.handlers[name]) {
        app.handlers[name] = { setup: app.handlers[name] };
      }

      if (! ('grown' in app.handlers[name])) {
        app.handlers[name] = grow(app, app.handlers[name]);
        app.handlers[name].grown = true;
      }

      return app.handlers[name];
    }


    if (! app.classes[klass]) {
      throw new Error('<' + klass + '> undefined handler!');
    }

    if (! app.handlers[klass]) {
      app.handlers[klass] = delegate(app, klass);
    }

    return app.handlers[klass];
  };


  // constructor
  Mohawk.bind = function (ns) {

    // locals
    var app = this;


    // API

    this.classes = {};
    this.modules = {};

    this.context = {

      globals: {},
      helpers: {},

      // apply this context
      send: function (partial, params) {
        var length,
            retval,
            index = 0;

        partial = 'object' === typeof partial && partial.length ? partial : [partial];
        params = 'object' === typeof params && params.length === undefined ? params : {};

        length = partial.length;

        for (; index < length; index += 1) {
          retval = partial[index].apply(app.context, [params]);
        }

        return retval;
      },

      // assembly urls
      url: function (name, params) {
        return app.router.recognizer.generate(name, params);
      },

      // redirections
      go: function (path, params, update) {
        var args = url_params(app, path, params, update);

        params = args[1] || {};
        update = args[2];

        if (path.charAt(0) === '/') {
          if (! app.router.recognizer.recognize(path)) {
            throw new Error('<' + path + '> route not found!');
          }

          return app.router.redirectURL(path, update);
        } else {
          return update ? app.router.redirectURL(args[0])
            : ! count(params) ? app.router.transitionTo(path)
            : app.router.transitionTo(path, params);
        }
      }
    };


    // module loading
    this.load = function (modules) {
      var index,
          module;

      if ('object' !== typeof modules) {
        modules = modules && [modules];
      }

      if (! modules || 0 === modules.length) {
        throw new Error('That require some modules!');
      }

      initialize(app, modules);

      return app;
    };


    // start
    this.run = function (block) {
      var klass,
          module;

      for (klass in ns) {
        if (klass.charAt(0) === klass.charAt(0).toUpperCase()) {
          app.load(ns[klass]);
        } else {
          app.classes[klass] = ns[klass];
        }
      }

      if ('function' === typeof block) {
        block.apply(app.context, [app]);
      }

      return app;
    };

  };


  // exports magic
  this.run = function (block) {
    var App = {},
        self = new Mohawk.bind(App),
        router = new Router(),
        length, index = 0,
        module;

    // settings
    self.handlers = {};
    self.router = router;

    // load modules
    for (module in modules) {
      length = modules[module].length;

      while (index < length) {
        modules[module][index].apply(self.context, [App]);
        index += 1;
      }
    }

    // attach events
    popevents.push(self);

    router.updateURL = function(path) {
      if (history && history.pushState) {
        history.pushState({ to: path }, doc.title, path);
      }
    };

    router.getHandler = function(name) {
      return Mohawk.broker(self, name);
    };

    router.redirectURL = function(path, update) {
      if (false !== update) {
        router.updateURL(path);
      }

      return router.handleURL(path);
    };

    return self.run(block);
  };


  // some isolation
  this.module = function (name, block) {
    if (! (name in modules)) {
      modules[name] = [];
    }

    modules[name].push(block);
  };

}).call(this);
