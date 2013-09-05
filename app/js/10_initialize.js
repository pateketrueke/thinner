
  // main module loader
  var initialize = function (app, modules) {
    var module,
        klass;

    for (module in modules) {
      if ('function' !== typeof modules[module]) {
        throw new Error('<' + ('string' === typeof module ? module : modules[module]) + '> is not a module!');
      }

      klass = String(modules[module]);
      klass = /function\s(.+?)\b/.exec(klass)[1] || undefined;

      module = new modules[module](app);

      if (! module.initialize_module || 'function' !== typeof module.initialize_module) {
        throw new Error('<' + klass + '#initialize_module> is missing!');
      }

      if (app.modules[klass]) {
        throw new Error('<' + klass + '> module already loaded!');
      }

      app.context.send(module.initialize_module, { draw: matcher.apply(module, [app]) });
      app.modules[klass] = module;
    }
  };
