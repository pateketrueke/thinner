
// reactive views
var view = function(from, name, handler) {
  var key,
      klass = from.classes[name];

  // lazy loading
  klass.partials = [];

  if (handler.partials) {
    for (key in handler.partials) {
      handler[key] = lazy(from, name, key);
      klass.partials.push(key);
    }
  }
};


// lazy objects
var lazy = function(from, name, partial) {
  var obj;

  return function(data, reset) {
    var params,
        slug = '#' + dasherize(name) + '__' + dasherize(partial);

    if (!obj || reset) {
      if (obj && reset) {
        obj.view.teardown();
      }

      obj = new from.classes[name][partial]();

      params = obj.view || {};
      params.el = params.el || slug;
      params.data = params.data || data || {};
      params.template = params.template || (slug + '-partial');

      // ractive.js
      obj.view = error(from, function() {
        return new Ractive(params);
      });

      if (obj.setup && 'function' === typeof obj.setup) {
        obj.setup();
      }
    }

    return obj;
  };
};
