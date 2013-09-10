
  // constructor
  var create = function (ns) {
    var app;

    // instance
    return app = {
      // API

      classes: {},
      modules: {},
      handlers: {},

      context: {

        history: [],

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
          var args = url_params(path, params, update),
              locals;

          params = args[1] || {};
          update = args[2];
          path = args[0];

          locals = params.locals;
          delete params.locals;

          if (path.charAt(0) === '/') {
            if (! app.router.recognizer.recognize(path)) {
              throw new Error('<' + path + '> route not found!');
            }

            return app.router.redirectURL(path, update, locals);
          } else {
            return update ? app.router.redirectURL(app.context.url(path, params), true, locals)
              : ! count(params) ? app.router.transitionTo(path)
              : app.router.transitionTo(path, params);
          }
        },

        // events
        on: attach('on'),
        off: attach('off'),
        one: attach('one')
      },


      // settings
      setup: function (block) {
        var key,
            params = {};

        if ('function' === typeof block) {
          block = block(params);
          block = 'object' === typeof block ? block : params;
        }

        if ('object' === typeof block) {
          for (key in block) {
            settings[key] = block[key] || settings[key];
          }
        }
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
      }

    };

  };
