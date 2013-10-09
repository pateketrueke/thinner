
  // basic extends
  var partial = function (path, vars, helpers) {
    var view,
        locals = {};

    vars = vars || {};
    path = path || 'undefined';

    view = 'app/templates/' + path.replace(/[^\w_-]/g, '/');

    if (! (view = settings.templates[view] || settings.templates[path])) {
      throw new Error("Missing '" + path + "' view!");
    }

    extend(locals, vars);
    extend(locals, helpers);

    locals.partial = function (path, vars) { return partial(path, vars, helpers); };

    try {
      return view(locals);
    } catch (exception) {
      throw new Error(String(exception) + ' (' + path +')');
    }
  };
