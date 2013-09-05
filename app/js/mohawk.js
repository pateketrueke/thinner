(function (undefined) {
  'use strict';

  // shortcuts
  var Mohawk,

      win = this.window,
      doc = this.document,
      history = win.history,
      popevents = [],
      modules = [],
      exception,
      running;


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
    var self = this;

    return function (fn) {
      var handler,
          handlers;

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

      app.context.send(module.initialize_module, { draw: matcher.apply(module, [app]) });
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

        if (e.state && e.state.to) {
          app = popevents[index];
          app.router.handleURL(e.state.to);
        }
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
  var broker = function (app, name) {
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
  var Bind = function (ns) {

    // instance
    var app = this;


    // API

    this.history = [];
    this.classes = {};

    this.modules = {};
    this.handlers = {};

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
        var args = url_params(app, path, params, update),
            locals;

        params = args[1] || {};
        update = args[2];

        locals = params.locals;
        delete params.locals;

        if (path.charAt(0) === '/') {
          if (! app.router.recognizer.recognize(path)) {
            throw new Error('<' + path + '> route not found!');
          }

          return app.router.redirectURL(path, update, locals);
        } else {
          return update ? app.router.redirectURL(args[0], true, locals)
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
    popevents.push(self);

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


  // some isolation
  this.Mohawk = function (block) {
    modules.push(block);
  };


  // singleton
  this.Mohawk.loader = function () {
    return running ? running : running = start();
  };

}).call(this);
