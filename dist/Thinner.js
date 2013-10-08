/*! Thinner - v0.6.0 - 2013-10-08 */
(function (undefined) {
  

  // shortcuts
  var global = this,
      exception,
      running,

      win = this.window,
      doc = this.document,
      hist = win.history;


  // loaded modules
  var modules = [];


  // application config
  var settings = {
    el: 'body',
    listen: 'click doubleclick submit input change', // basics (?)
    templates: global.JST || {}
  };


  // handled methods on error
  var methods = 'enter setup serialize'.split(' ');


  // ...
  var root;


  // default hooks
  var grow = function (from, handler) {
    var key;

    if (! ('model' in handler)) {
      handler.model = proxy;
    }

    // delegate all event handlers
    if ('object' === typeof handler.events) {
      handler.events = handle(handler, handler.events);
    }

    handler.events = handler.events || {};
    handler.events.error = raise.call(handler, from, handler.events.error || undefined);

    // error handling (?)
    for (key in methods) {
      handler[methods[key]] = raise.call(handler, from, handler[methods[key]]);
    }
  };


  // nice handlers
  var camelize = function (str) {
    return str.replace(/[._-][a-z]/g, function ($0) { return $0.substr(1).toUpperCase(); });
  };


  // nice names
  var dasherize = function (str) {
    return str.replace(/[A-Z]/g, function ($0) { return '-' + $0.toLowerCase(); });
  };


  // mixin for passing params
  var proxy = function (params) { return params; };


  // safe arrays
  var slice = Array.prototype.slice;


  // object length
  var count = function (set) {
    var index,
        length = 0;

    for (index in set) {
      length += parseInt(set.hasOwnProperty(index), 10);
    }

    return length;
  };


  // CSS selector/DOM utility
  var elem = function () {
    var $;

    if (! ($ = global.Zepto || global.jQuery || global.$)) {
      throw new Error('jQuery-compatible library is required!');
    }

    if (! arguments.length) {
      return $;
    }

    return $.apply($, arguments);
  };


  // remove handlers
  var dispose = function (from, name, fn) {
    return function () {
      var retval = 'function' === typeof fn ? fn.apply(null, arguments) : undefined,
          partial;

      // delegated views (?)
      while (partial = from.handlers[name].partials.pop()) {
        from.handlers[name][partial]().view.teardown();
      }

      // only if can be created again
      delete from.handlers[name];

      return retval;
    };
  };


  // bind handlers
  var delegate = function (from, name) {
    var handler;

    handler = new from.classes[name](from);

    grow(from, handler);
    view(from, name, handler);

    handler.exit = dispose(from, name, handler.exit || undefined);

    return handler;
  };


  // mixin for grown-up handlers
  var handle = function (self, mixin) {
    var key;

    // loop all methods
    if ('object' === typeof mixin) {
      for (key in mixin) {
        if ('function' === typeof mixin[key]) {
          mixin[key] = handle(self, mixin[key]);
        }
      }
    } else if ('function' === typeof mixin) {
      return function () { return mixin.apply(self, arguments); };
    }

    return mixin;
  };


  // normalize arguments for url()
  var url_params = function (path, params, update) {
    if ('boolean' === typeof params) {
      update = params;
      params = undefined;
    }

    // history states
    if ('object' === typeof path) {
      params = path;
      path = params.to || undefined;

      delete params.to;
    }

    update = params && params.update || update;
    update = null == update ? true : update;

    return [path, params || {}, update];
  };


  // main module loader
  var initialize = function (app, modules) {
    var module;

    for (module in modules) {
      if ('function' !== typeof modules[module]) {
        throw new Error('<' + modules[module] + '> is not a module!');
      }

      app.modules.push(new modules[module](app));
    }
  };


  // handle url changes
  var popstate = function (app) {
    return function (e) {
      if (e.state && e.state.to) {
        app.router.handleURL(e.state.to);
      }
    };
  };


  // cached objects
  var broker = function (app, name) {
    var klass = camelize(name);

    // classes first
    if (app.classes[klass]) {
      if (! app.handlers[klass]) {
        app.handlers[klass] = delegate(app, klass);
      }

      return app.handlers[klass];
    }

    throw new Error('<' + klass + '> undefined handler!');
  };


  // constructor
  var create = function (ns) {
    var app,
        tmp = {};

    // instance
    return app = {
      // router.js
      router: new Router(),

      // setup
      history: [],
      modules: [],

      // context
      classes: {},
      handlers: {},

      // functions
      helpers: {},
      imports: {},

      exports: function (key, fn) {
        var hash = {};

        if ('function' === typeof fn) {
          hash[key] = fn;
        } else {
          hash = key;
        }

        extend(app.imports, handle(app, hash));
      },


      // templating
      render: function (path, vars) {
        return partial(path, vars, app.helpers);
      },


      // registry
      set: function (key, value) {
        return store.call(tmp, key, value);
      },

      get: function (key) {
        return lookup.apply(tmp, key.split('.'));
      },


      // assembly urls
      url: function (name, params) {
        return error(app, function () {
          return app.router.recognizer.generate(name, params);
        });
      },


      // redirections
      go: function (path, params, update) {
        var args = url_params(path, params, update);

        params = args[1] || {};
        update = args[2];
        path = args[0];

        return error(app, function () {
          if (path.charAt(0) === '/') {
            if (! app.router.recognizer.recognize(path)) {
              throw new Error('<' + path + '> route not found!');
            }

            return app.router.redirectURL(path, update);
          } else {
            return update ? app.router.redirectURL(app.url(path, params), true)
              : ! count(params) ? app.router.replaceWith(path)
              : app.router.replaceWith(path, params);
          }
        }, RSVP.reject());
      },


      // module loading
      load: function (modules) {
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
      },


      // start
      run: function (block) {
        var klass,
            module;

        for (klass in ns) {
          if ('_' !== klass.charAt(0) && klass.charAt(0) === klass.charAt(0).toUpperCase()) {
            app.load(ns[klass]);
          } else {
            app.classes[klass] = ns[klass];
          }
        }

        if ('function' === typeof block) {
          block(app);
        }

        return app;
      }

    };

  };


  // exports magic
  var start = function () {
    var app = {},
        self = create(app),
        module, events, evt;

    // load modules
    for (module in modules) {
      modules[module].call(self, app);
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
        self.history.push({ to: path });
      } else {
        self.router.replaceURL(path);
      }

      return self.router.handleURL(path);
    };

    return self;
  };


  // event manager
  var observe = function (app, evt) {
    // listen to every event from root
    root.on(evt + '.action', '.js-action', function (e) {
      var key, action, handler, current, retval,
          data, el;

      for (key in app.router.currentHandlerInfos) {
        current = app.router.currentHandlerInfos[key].handler;

        if ('object' === typeof current.actions) {
          el = elem(e.currentTarget);
          action = el.data('action');

          for (data in current.actions) {
            handler = data.split('.')[0];

            if (action === handler && data.lastIndexOf('.' + evt) > 0) {
              retval = raise.call(current, app, current[current.actions[data]])(e, el);
            }
          }
        }
      }

      // after all
      return retval;
    });
  };


  // event-error delegation
  var raise = function (app, fn) {
    var self = this;

    return function () {
      var args = arguments;

      return error(app, function () {
        return 'function' === typeof fn && fn.apply(self, args);
      });
    };
  };


  // error handler
  var error = function (app, block, defval) {
    var retval, klass, err;

    try {
      retval = 'function' === typeof block && block();
    } catch (exception) {
      err = String(exception).indexOf('route not found') === -1 ? 'errorHandler' : 'notFound';

      if ('function' === typeof app.classes[err]) {
        klass = new app.classes[err](app);

        // rethrow within possible
        if ('function' === typeof klass.exception) {
          klass.exception(exception);

          return defval;
        }
      }

      throw exception;
    }

    return retval;
  };


  // reactive views
  var view = function (from, name, handler) {
    var key,
        klass = from.classes[name];

    // lazy loading
    handler.partials = [];

    for (key in klass) {
      if (klass.hasOwnProperty(key) && key.charAt() !== '_') {
        if (key in handler) {
          throw new Error('<' + partials[length] + '> already defined!');
        }

        handler[key] = lazy(from, name, key);
        handler.partials.push(key);
      }
    }
  };


  // lazy objects
  var lazy = function (from, name, partial) {
    var obj;

    return function (data, reset) {
      var params,
          slug = '#' + dasherize(name) + '__' + dasherize(partial);

      if (! obj || reset) {
        if (obj && reset) {
          obj.view.teardown();
        }

        obj = new from.classes[name][partial](from);

        params = obj.view || {};
        params.el = params.el || slug;
        params.data = params.data || data || {};
        params.template = params.template || (slug + '-partial');

        // ractive.js
        obj.view = error(from, function () {
          return new Ractive(params);
        });

        obj.setup();
      }

      return obj;
    };
  };


  // retrieve container
  var lookup = function () {
    var keys = slice.call(arguments),
        root = keys.shift(),
        retval;

    if (this[root]) {
      retval = this[root];
    }

    return keys.length ? lookup.apply(retval, keys) : retval;
  };


  // registry container
  var store = function (key, value) {
    this[key] = value;
  };


  // basic extends
  var partial = function (path, vars, helpers) {
    var view,
        locals = {};

    vars = vars || {};
    path = path || 'undefined';

    view = 'app/templates/' + path.replace(/[^\w_-]/g, '/');

    if (! (view = settings.templates[view] || settings.templates[path])) {
      throw new Error("Missing '" + path + "' view!");
    }

    extend(locals, vars);
    extend(locals, helpers);

    locals.partial = function (path, vars) { return partial(path, vars, helpers); };

    try {
      return view.call(null, locals);
    } catch (exception) {
      throw new Error(String(exception) + ' (' + path +')');
    }
  };


  // basic extends
  var extend = function (self, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        self[key] = source[key];
      }
    }
  };


  // some isolation
  var thinner = function (block) {
    modules.push(block);
  };


  // singleton
  thinner.loader = function (config) {
    if (! running) {
      thinner.setup(config);
      root = elem(settings.el || 'body', doc);
      running = start();
    }

    return running;
  };


  // settings
  thinner.setup = function (block) {
    var key,
        params = {};

    if ('function' === typeof block) {
      block = block.call(params, params);
      block = 'object' === typeof block ? block : params;
    }

    if ('object' === typeof block) {
      for (key in block) {
        settings[key] = block[key] || settings[key];
      }
    }
  };


  // expose
  if ('undefined' !== typeof module && module.exports) {
    module.exports = thinner;
  } else if ('function' === typeof define && define.amd) {
    define(function () { return thinner; });
  } else {
    this.thinner = thinner;
  }

}).call(this);
