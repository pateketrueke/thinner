
  // some isolation
  Mohawk = function (block) {
    modules.push(block);
  };


  // singleton
  Mohawk.loader = function (config) {
    if (! running) {
      Mohawk.setup(config);
      root = elem(settings.el || 'body', doc);
      running = start();
    }

    return running;
  };


  // settings
  Mohawk.setup = function (block) {
    var key,
        params = {};

    if ('function' === typeof block) {
      block = block.apply(params, [params]);
      block = 'object' === typeof block ? block : params;
    }

    if ('object' === typeof block) {
      settings = merge(settings, block);
    }
  };


  // expose
  this.mohawk = Mohawk;

//!}).call(this);
