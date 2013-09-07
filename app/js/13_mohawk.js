
  // constructor
  Mohawk = function (ns) {

    // instance
    var app = this;

    // delegate methods
    var hook = function (method) {
      return function () {
        return attach.apply(null, [method].concat(slice.call(arguments)));
      };
    };


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
      },

      // events

      on: hook('on'),
      off: hook('off'),
      one: hook('one')
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
