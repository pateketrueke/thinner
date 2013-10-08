
  // some isolation
  var thinner = function (block) {
    modules.push(block);
  };


  // singleton
  thinner.loader = function (config) {
    if (! running) {
      thinner.setup(config);
      root = elem(settings.el || 'body', doc);
      running = start();
    }

    return running;
  };


  // settings
  thinner.setup = function (block) {
    var key,
        params = {};

    if ('function' === typeof block) {
      block = block.call(params, params);
      block = 'object' === typeof block ? block : params;
    }

    if ('object' === typeof block) {
      for (key in block) {
        settings[key] = block[key] || settings[key];
      }
    }
  };


  // expose
  if ('undefined' !== typeof module && module.exports) {
    module.exports = thinner;
  } else if ('function' === typeof define && define.amd) {
    define(function () { return thinner; });
  } else {
    this.thinner = thinner;
  }

//!}).call(this);
