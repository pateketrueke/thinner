
  // set local-scope
  var loader = function (config) {
    var app = {};

    if (! running) {
      running = create(app);
      start(running);
    }

    if (config) {
      thinner.setup(config);
    }

    return running;
  };
