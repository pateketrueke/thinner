
  // some isolation
  this.Mohawk = function (block) {
    modules.push(block);
  };


  // singleton
  this.Mohawk.loader = function () {
    return running ? running : running = start();
  };

//}).call(this);
