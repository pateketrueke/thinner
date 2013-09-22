(function (undefined) {
  

  // shortcuts
  var Mohawk,

      global = this,
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
    listen: 'touchstart touchmove touchend touchcancel keydown keyup keypress mousedown mouseup contextmenu ' +
            'click doubleclick mousemove focusin focusout mouseenter mouseleave submit input change ' +
            'dragstart drag dragenter dragleave dragover drop dragend'
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

    return handler;
  };


  // nice handlers
  var camelize = function (str) {
    return str.replace(/[._-][a-z]/g, function ($0) { return $0.substr(1).toUpperCase(); });
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


  // combine objects
  var merge = function (raw, args) {
    var $ = elem();

    if (true === raw) {
      return $.extend.apply($, [true, {}].concat(args));
    }

    return $.extend.apply($, [true, {}, raw].concat(slice.call(arguments, 1)));
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

      module = new modules[module](app);

      if ('function' === typeof module.define) {
        module.define.call(app.context, module);
      }
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
    var app;

    // instance
    return app = {
      // router.js
      router: new Router(),

      // API

      history: [],

      classes: {},
      handlers: {},

      context: {
        globals: {},
        helpers: {}
      },


      // new objects
      factory: function () {
        return new arguments[0](app, merge(true, slice.call(arguments, 1)));
      },


      // apply this context
      send: function (partial) {
        var length,
            retval,
            index = 0,
            params = {};

        partial = 'object' === typeof partial && partial.length ? partial : [partial];
        params = merge(true, slice.call(arguments, 1)) || {};
        length = partial.length;

        for (; index < length; index += 1) {
          retval = partial[index].call(app.context, params);
        }

        return retval;
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
          block.call(app.context, app);
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
      modules[module].call(self.context, app);
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


  // some isolation
  Mohawk = function (block) {
    modules.push(block);
  };


  // singleton
  Mohawk.loader = function (config) {
    if (! running) {
      Mohawk.setup(config);
      root = elem(settings.el || 'body', doc);
      running = start();
    }

    return running;
  };


  // settings
  Mohawk.setup = function (block) {
    var key,
        params = {};

    if ('function' === typeof block) {
      block = block.call(params, params);
      block = 'object' === typeof block ? block : params;
    }

    if ('object' === typeof block) {
      settings = merge(settings, block);
    }
  };


  // expose
  this.mohawk = Mohawk;

}).call(this);
