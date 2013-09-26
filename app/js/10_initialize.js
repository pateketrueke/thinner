
  // main module loader
  var initialize = function (app, modules) {
    var module;

    for (module in modules) {
      if ('function' !== typeof modules[module]) {
        throw new Error('<' + modules[module] + '> is not a module!');
      }

      app.modules.push(new modules[module](app));
    }
  };
