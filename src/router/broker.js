
// cached objects
var broker = function(app, name) {
  var klass = camelize(name);

  // classes first
  if (app.classes[klass]) {
    if (!app.handlers[klass]) {
      app.handlers[klass] = delegate(app, klass);
    }

    return app.handlers[klass];
  }

  throw new Error('<' + klass + '> undefined handler!');
};
