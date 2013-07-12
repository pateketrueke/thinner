(function (root) {
  'use strict';

  root.App = (function (undefined) {
    return function (router) {
      // private
      var instance,
          matcher,
          method,
          exception,
          load_modules,
          required = ['Router', 'RouteRecognizer', 'RSVP'],
          defaults = router === undefined || 'function' !== typeof router,
          default_path = document.location.pathname || '/',
          default_context = document.body || null;


      // dependencies (?)
      try {
        router = defaults ? new Router() : router ? router() : null;
      } catch (e) {
        throw new Error('<' + required.join(',') + '> are missing classes?');
      } finally {
        if (! router) {
          throw new Error('Missing a valid router!');
        }
      }


      // binding
      matcher = function (routes) {
        var key,
            result,
            handler,
            handlers = {};

        router.map(function(match) {
          handlers = routes(match) || {};
        });

        for (key in handlers) {
          handler = handlers[key];

          this[key] = typeof handler === 'function' ? { setup: handler } : handler;
          this[key].events = (result = this[key].events || null) !== null ? result : {};

          router.handlers[key] = this[key];
        }
      };


      // methods
      loader = function (modules) {
        var module,
            klass,
            index = 0,
            length = modules.length;

        for (; index < length; index += 1) {
          if ('function' !== typeof modules[index]) {
            throw new Error('<' + modules[index] + '> is not a module!');
          }

          module = new modules[index]();

          if (! module.initialize_module || 'function' !== typeof module.initialize_module) {
            klass = modules[index].toString();
            klass = /\s(.+?)\b/.exec(klass)[1];

            throw new Error('<' + klass + '#initialize_method> is missing!');
          }

          module.initialize_module({ draw: matcher });
          modules[index] = { module: module, klass: klass };
        }

        return modules;
      };


      // public
      instance = {
        modules: [],
        history: [],
        router: router,
        context: context,


        run: function (context, path) {
          if (! this.modules || 0 === this.modules.length) {
            throw new Error('<App#load> cannot run without modules!');
          }

          path = path && path.toString();

          if ('string' !== typeof path || 0 !== path.indexOf('/')) {
            throw new Error('<' + path + '> missing root slash!');
          }

          router.handleURL(path);

          return this;
        },

        load: function (modules) {
          if (! modules || 0 === modules.length) {
            throw new Error('<App#load> require some modules!');
          }

          this.modules = loader(modules);

          return this;
        },

        url: function (name, params) {
          try {
            return router.recognizer.generate(name, params);
          } catch (exception) {
            throw new Error('<' + name + '> route not found or missing params!');
          }
        },

        goto: function (path) {
          return router.redirect(path, false);
        },

        trigger: function () {
          return router.trigger.apply(router, arguments);
        },

        redirect: function () {
          return router.redirect.apply(router, arguments);
        }
      };


      // construct
      if (defaults) {
        router.handlers = {};

        router.updateURL = function(path) {
          return history.pushState({}, 'Untitled', path);
        };

        router.getHandler = function(name) {
          return router.handlers[name] || {};
        };

        router.redirect = function(path, update) {
          try {
            router.handleURL(path);
          } catch (exception) {
            throw new Error('<' + path + '> unknown route!');
          }

          if (false !== update) {
            instance.history.push(path);
            router.updateURL(path);
          }

          return router;
        };
      }

      return instance;
    };
  })();

})(this);
