
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

      extend: function (key, fn) {
        extend(app.imports, handle(app, 'function' === typeof fn ? { key: fn } : key));
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
