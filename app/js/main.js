(function (root) {
  'use strict';

  root.App = (function (undefined) {
    return function (context, path) {
      // private
      var exception, instance, matcher, loader, router,
          required = ['Router', 'RouteRecognizer', 'RSVP'],
          default_path = path || document.location.pathname || '/',
          default_context = context || document.body,
          default_modules = [],
          default_mixin;


      // dependencies (?)
      for (instance in required) {
        if (! root[required[instance]]) {
          throw new Error('<' + required[instance] + '> missing class!');
        }
      }

      // router.js
      router = new Router();


      // models
      default_mixin = function (params) { return params; };


      // binding
      matcher = function (routes) {
        var key,
            result,
            handler,
            handlers = {};

        router.map(function(match) {
          handlers = routes.apply(instance.context, [match]) || {};
        });

        for (key in handlers) {
          handler = handlers[key];

          this[key] = typeof handler === 'function' ? { setup: handler } : handler;
          this[key].events = (result = this[key].events || null) !== null ? result : {};

          router.handlers[key] = this[key];

          if (! ('model' in this[key])) {
            this[key].model = default_mixin;
          }
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
            klass = String(modules[index]);
            klass = /\s(.+?)\b/.exec(klass)[1];

            throw new Error('<' + klass + '#initialize_module> is missing!');
          }

          module.initialize_module.apply(instance.context, [{ draw: matcher }]);
          modules[index] = module;
        }

        return modules;
      };


      // public
      instance = {
        name: 'Lineman',
        router: router,
        history: [default_path],
        context: {
          $: {}, // UI

          // locals
          el: default_context,
          uri: default_path,
          globals: {},
          helpers: {
            url_for: function (path, params) { return instance.url(path, params); },
            link_to: function (path) { return path.link(instance.url(path)); }
          },

          send: function (partial, params) {
            var length,
                index = 0;

            partial = 'object' === typeof partial && partial.length ? partial : [partial];
            params = 'object' === typeof params && params.length === undefined ? params : {};

            length = partial.length;

            for (; index < length; index += 1) {
              partial[index].apply(instance.context, [params]);
            }
          }
        },

        run: function () {
          if (! default_modules || 0 === default_modules.length) {
            throw new Error('<App#load> cannot run without modules!');
          }

          return this.go(this.context.uri, false);
        },

        load: function (modules) {
          var index,
              module;

          if ('function' === typeof modules) {
            modules = [modules];
          }

          if (! modules || 0 === modules.length) {
            throw new Error('<App#load> require some modules!');
          }

          modules = loader(modules);

          for (index in modules) {
            module = modules[index];
            default_modules.push(module);
          }

          return this;
        },

        url: function (name, params) {
          try {
            return router.recognizer.generate(name, params);
          } catch (exception) {
            throw new Error('<' + name + '> route not found or missing params!');
          }
        },

        go: function (url, params, update) {
          if ('boolean' === typeof params) {
            update = params;
            params = undefined;
          } else {
            update = params && params.update || update;
          }

          if (String(url).charAt(0) !== '/') {
            url = this.url(url, params || {});
          }

          router.redirectURL(path, update == null ? true : update);

          return this;
        }
      };


      // construct
      router.handlers = {};

      router.updateURL = function(path) {
        history.pushState({}, instance.title, path);
      };

      router.getHandler = function(name) {
        return router.handlers[name] || {};
      };

      router.redirectURL = function(path, update) {
        try {
          if (false !== update) {
            instance.history.push(path);
            router.updateURL(path);
            router.handleURL(path);
          } else {
            router.handleURL(path);
          }
        } catch (exception) {
          throw new Error('<' + path + '> unknown route!');
        }
      };

      return instance;
    };
  })();

})(this);
