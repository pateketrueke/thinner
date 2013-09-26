
  // some isolation
  Thinner = function (block) {
    modules.push(block);
  };


  // singleton
  Thinner.loader = function (config) {
    if (! running) {
      Thinner.setup(config);
      root = elem(settings.el || 'body', doc);
      running = start();
    }

    return running;
  };


  // settings
  Thinner.setup = function (block) {
    var key,
        params = {};

    if ('function' === typeof block) {
      block = block.call(params, params);
      block = 'object' === typeof block ? block : params;
    }

    if ('object' === typeof block) {
      settings = merge(settings, block);
    }
  };


  // expose
  if ('undefined' !== typeof module && module.exports) {
    module.exports = Thinner;
  } else if ('function' === typeof define && define.amd) {
    define(function () { return Thinner; });
  } else {
    this.Thinner = Thinner;
  }

//!}).call(this);
