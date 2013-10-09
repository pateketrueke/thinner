
  // some isolation
  var thinner = function (block) {
    modules.push(block);
  };


  // singleton
  thinner.loader = function (config) {
    return scope(config);
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

    // reset
    if (root) {
      root.off('**');
    }

    root = elem(settings.el || 'body', doc);

    // listen all events
    events = 'string' === typeof settings.listen ? settings.listen.split(' ') : settings.listen;

    for (evt in events) {
      observe(running, events[evt]);
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
