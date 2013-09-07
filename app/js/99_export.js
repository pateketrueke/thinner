
  // some isolation
  this.mohawk = function (block) {
    modules.push(block);
  };


  // singleton
  this.mohawk.loader = function () {
    return running ? running : running = start();
  };

//!}).call(this);
