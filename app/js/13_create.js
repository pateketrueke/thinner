
  // constructor
  var create = function (ns) {
    var app;

    // instance
    return app = {
      // router.js
      router: new Router(),

      // API

      classes: {},
      handlers: {},

      context: {

        history: [],

        globals: {},
        helpers: {},

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
              return update ? app.router.redirectURL(app.context.url(path, params), true)
                : ! count(params) ? app.router.replaceWith(path)
                : app.router.replaceWith(path, params);
            }
          });
        },

        // events
        on: attach('on'),
        off: attach('off'),
        one: attach('one')
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
