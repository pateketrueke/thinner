
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
