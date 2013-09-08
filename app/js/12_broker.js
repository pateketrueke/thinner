
  // cached objects
  var broker = function (app, name) {
    var klass = camelize(name);

    // backward compatibility
    if (app.handlers[name]) {
      if ('function' === typeof app.handlers[name]) {
        app.handlers[name] = { setup: app.handlers[name] };
      }

      if (! ('grown' in app.handlers[name])) {
        app.handlers[name] = grow(app, app.handlers[name], true);
        app.handlers[name].grown = true;
      }

      return app.handlers[name];
    }


    if (! app.classes[klass]) {
      throw new Error('<' + klass + '> undefined handler!');
    }

    if (! app.handlers[klass]) {
      app.handlers[klass] = delegate(app, klass);
    }

    return app.handlers[klass];
  };
