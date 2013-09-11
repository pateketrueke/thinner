
  // some isolation
  Mohawk = function (block) {
    modules.push(block);
  };


  // singleton
  Mohawk.loader = function () {
    if (! running) {
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
      block = block(params);
      block = 'object' === typeof block ? block : params;
    }

    if ('object' === typeof block) {
      for (key in block) {
        settings[key] = block[key] || settings[key];
      }
    }
  };


  // expose
  this.mohawk = Mohawk;

//!}).call(this);
