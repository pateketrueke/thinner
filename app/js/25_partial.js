
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

    locals.partial = partial;

    try {
      return view.call(null, locals);
    } catch (exception) {
      throw new Error(String(exception) + ' (' + path +')');
    }
  };
