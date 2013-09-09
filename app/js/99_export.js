
  // some isolation
  this.mohawk = function (block) {
    modules.push(block);
  };


  // singleton
  this.mohawk.loader = function () {
    if (! running) {
      root = elem('body', doc);
      running = start();
    }

    return running;
  };

//!}).call(this);
