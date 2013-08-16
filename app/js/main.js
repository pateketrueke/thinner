(function (global, doc) {
  'use strict';

  var App = (function (undefined) {

    // static
    var default_binding, default_mixin, default_elem, make_elem,
        class_regex = /^\.-?[_a-zA-Z]+[\w.-]*$/,
        tag_regex = /^[a-zA-Z][a-zA-Z]*$/,
        id_regex = /^#[a-zA-Z][\w-]*$/;


    // context
    default_binding = function (self, mixin) {
      var key,
          out = {};

      if ('function' === typeof mixin) {
        return function () {
          return mixin.apply(self, arguments);
        };
      }

      for (key in mixin) {
        out[key] = default_binding(self, mixin[key]);
      }

      return out;
    };


    // models
    default_mixin = function (params) { return params; };


    // DOM
    default_elem = function (input) {
      var output;

      if ('object' === typeof input) {
        if (input.nodeType) {
          output = input;
        } else if (input[0] && input[0].nodeType) {
          output = input[0];
        }
      } else if ('string' === typeof input) {
        if (doc[input]) {
          output = doc[input];
        } else if (doc.getElementById) {
          output = doc.getElementById(input);
        }

        if (! output) {
          if (class_regex.test(input)) {
            output = doc.getElementsByClassName(input.substr(1).replace(/\./g, ' '));
          } else if (tag_regex.test(input)) {
            output = doc.getElementsByTagName(input);
          } else if (id_regex.test(input)) {
            output = doc.getElementById(input.substr(1));
          } else {
            output = doc.querySelectorAll(input);
          }
        }
      }

      return output;
    };

    make_elem = function (tag) {
      return doc.createElement && doc.createElement(tag);
    };


    // instance
    return function (path) {
      // private
      var exception, instance, matcher, loader, router,
          default_path = path || '/',
          default_link,
          link_params,
          url_params,
          redirect,
          popstate,
          cache = {};


      // router.js
      router = new Router();


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

      popstate = function (e) {
        if (e.state && e.state.to) {
          instance.context.go(e.state.to, false);
        }
      };


      // UJS
      default_link = function (path, params) {
        var a = make_elem('a'),
            attribute,
            href;

        url_params = link_params(path, params);
        href = url_params.shift();
        params = url_params.shift();
        a.innerHTML = path;
        a.href = href;

        // FIX: PhantomJS (?)
        a.click = redirect(href);

        if (a.addEventListener) {
          a.addEventListener('click', redirect(href), false);
        } else if (a.attachEvent) {
          a.attachEvent('onclick', redirect(href));
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
            handler,
            handlers = {};

        self = this;

        router.map(function(match) {
          handlers = routes.apply(self, [match]) || {};
        });

        for (key in handlers) {
          handler = handlers[key];
          this[key] = typeof handler === 'function' ? { setup: handler } : handler;

          if (! ('model' in this[key])) {
            this[key].model = default_mixin;
          }

          router.handlers[key] = default_binding(instance.context, this[key]);
        }
      };


      // methods
      loader = function (modules) {
        var module,
            klass,
            out = {};

        for (module in modules) {
          if (! isNaN(-module)) {
            klass = String(modules[module]);
            klass = /function\s(.+?)\b/.exec(klass)[1] || null;
          } else {
            klass = module;
          }

          if ('function' !== typeof modules[module]) {
            throw new Error('<' + (klass || modules[module]) + '> is not a module!');
          }

          module = new modules[module](instance);

          if (! module.initialize_module || 'function' !== typeof module.initialize_module) {
            throw new Error('<' + klass + '#initialize_module> is missing!');
          }

          instance.context.send(module.initialize_module, { draw: default_binding(module, matcher) });

          out[klass] = module;
        }

        return out;
      };


      // public
      instance = {
        router: router,
        modules: {},
        context: {
          // locals
          globals: {},
          helpers: {},

          // API
          find: function (selector, cached) {
            if ('string' === typeof selector) {
              if (false !== cached && null != cache[selector]) {
                return cache[selector];
              }

              return cache[selector] = default_elem(selector) || null;
            }

            return default_elem(selector);
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

          return this.context.go(default_path, false);
        },

        load: function (modules) {
          var index,
              module;

          if ('object' !== typeof modules) {
            modules = modules && [modules];
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
        if (global.history && global.history.pushState) {
          global.history.pushState({ to: path }, null, path);
        }
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


      if (global.addEventListener) {
        global.addEventListener('popstate', popstate);
      } else {
        global.onpopstate = popstate;
      }

      return instance;
    };
  })();


  // helpers (?)
  App.modules = function () {
    var module,
        list = {};

    for (module in App) {
      if (module.charAt(0) === module.charAt(0).toUpperCase()) {
        list[module] = App[module];
      }
    }

    return list;
  };


  // export
  if ('undefined' !== typeof module && module.exports) {
    module.exports = App;
  } else if ('function' === typeof define && define.amd) {
    define(function () { return App; });
  } else {
    global.App = App;
  }

})(window, document);
