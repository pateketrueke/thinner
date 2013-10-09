
  // set local-scope
  var scope = function (config) {
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
