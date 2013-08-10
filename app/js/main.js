(function (root) {
  'use strict';

  root.App = (function (undefined) {
    return function (context, path) {
      // private
      var exception, instance, matcher, loader, router,
          default_path = path || document.location.pathname || '/',
          default_context = context || document.body,
          default_mixin,
          default_link,
          link_params,
          url_params,
          redirect;


      // router.js
      router = new Router();


      // models
      default_mixin = function (params) { return params; };


      // links
      link_params = function (path, params, update) {
        if ('boolean' === typeof params) {
          update = params;
          params = undefined;
        }

        if (String(path).charAt(0) !== '/') {
          path = instance.context.url(path, params || {});
        }

        update = params && params.update || update;
        update = null == update ? true : update;

        return [path, params || {}, update];
      };

      redirect = function (to) {
        return function (e) {
          if (e && e.preventDefault) {
            e.preventDefault();
          }

          instance.context.go(to);

          return false;
        };
      };


      // UJS
      default_link = function (path, params) {
        var a = document.createElement('a'),
            attribute,
            href;

        url_params = link_params(path, params);
        href = url_params.shift();
        params = url_params.shift();
        a.innerHTML = path;
        a.href = href;

        if (! a.click) {
          // FIX: PhantomJS (?)
          a.click = redirect(href);
        } else if (params.addEventListener) {
          a.addEventListener('click', redirect(href), false);
        } else {
          a.onclick = redirect(href);
        }

        for (attribute in params) {
          a[attribute] = params[attribute];
        }

        return a;
      };


      // binding
      matcher = function (routes) {
        var key,
            self,
            result,
            handler,
            handlers = {};

        self = this;

        router.map(function(match) {
          handlers = routes.apply(self, [match]) || {};
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
        var binding,
            module,
            klass;

        binding = function (self, mixin) {
          return function (routes) {
            return mixin.apply(self, [routes]);
          };
        };

        for (module in modules) {
          if (! isNaN(parseInt(module, 10))) {
            klass = String(modules[module]);
            klass = /\s(.+?)\b/.exec(klass)[1];
          } else {
            klass = module;
          }

          if ('function' !== typeof modules[module]) {
            throw new Error('<' + klass + '> is not a module!');
          }

          module = new modules[module](instance);

          if (! module.initialize_module || 'function' !== typeof module.initialize_module) {
            throw new Error('<' + klass + '#initialize_module> is missing!');
          }

          instance.context.send(module.initialize_module, { draw: binding(module, matcher) });

          modules[klass] = module;
        }

        return modules;
      };


      // public
      instance = {
        router: router,
        modules: {},
        context: {
          $: {}, // UI

          // locals
          el: default_context,
          uri: default_path,
          globals: {},
          helpers: {},

          // API
          send: function (partial, params) {
            var length,
                index = 0;

            partial = 'object' === typeof partial && partial.length ? partial : [partial];
            params = 'object' === typeof params && params.length === undefined ? params : {};

            length = partial.length;

            for (; index < length; index += 1) {
              partial[index].apply(instance.context, [params]);
            }
          },

          link: function (path, params, update) { return default_link(path, params, update); },

          url: function (name, params) {
            try {
              return router.recognizer.generate(name, params);
            } catch (exception) {
              throw new Error('<' + name + '> route not found or missing params!');
            }
          },

          go: function (path, params, update) {
            url_params = link_params(path, params, update);

            router.redirectURL(url_params.shift(), url_params.pop());
          }
        },

        run: function () {
          if (! this.modules || 0 === this.modules.length) {
            throw new Error('<App#load> cannot run without modules!');
          }

          return this.context.go(this.context.uri, false);
        },

        load: function (modules) {
          var index,
              module;

          if ('object' !== typeof modules) {
            modules = [modules];
          }

          if (! modules || 0 === modules.length) {
            throw new Error('<App#load> require some modules!');
          }

          modules = loader(modules);

          for (index in modules) {
            if (! this.modules[index] && 'object' === typeof modules[index]) {
              module = modules[index];
              this.modules[index] = module;
            }
          }

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
        if (false !== update) {
          router.updateURL(path);
          router.handleURL(path);
        } else {
          router.handleURL(path);
        }
      };

      return instance;
    };
  })();


  // helpers (?)
  root.App.modules = function () {
    var module,
        list = {};

    for (module in root.App) {
      if (module.charAt(0) === module.charAt(0).toUpperCase()) {
        list[module] = root.App[module];
      }
    }

    return list;
  };

})(this);
