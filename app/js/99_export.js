
  // some isolation
  var thinner = function (block) {
    modules.push(block);
  };


  // singleton
  thinner.scope = function (config) {
    return loader(config);
  };


  // settings
  thinner.setup = function (block) {
    var key,
        params = {},
        events, evt;

    if ('function' === typeof block) {
      block = block.call(params, params);
      block = 'object' === typeof block ? block : params;
    }

    if ('object' === typeof block) {
      for (key in block) {
        settings[key] = block[key] || settings[key];
      }
    }

    if (root) {
      root.off('**');
    }

    if (settings.el) {
      // reset
      root = elem(settings.el);

      // listen all events
      events = 'string' === typeof settings.listen ? settings.listen.split(' ') : settings.listen;

      for (evt in events) {
        observe(running, events[evt]);
      }
    }

    return thinner;
  };


  // runner
  thinner.bind = function (block) {
    var that = loader();

    block.call(that, that);

    return thinner;
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
