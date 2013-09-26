
  // lazy objects
  var lazy = function (from, name, partial) {
    var obj;

    return function () {
      var params,
          slug = '#' + dasherize(name) + '__' + dasherize(partial);

      if (! obj) {
        obj = new from.classes[name][partial](from);

        params = obj.view || {};
        params.el = params.el || slug;
        params.template = params.template || (slug + '-partial');

        // ractive.js
        obj.view = error(from, function () {
          return new Ractive(params);
        });

        obj.setup();
      }

      return obj;
    };
  };

