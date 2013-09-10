
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


  // expose
  this.mohawk = Mohawk;

//!}).call(this);
