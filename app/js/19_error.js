
  // error handler
  var error = function (app, block, defval) {
    var retval, klass, err;

    try {
      retval = block.apply(this, arguments);
    } catch (exception) {
      err = 'isAborted' in exception ? 'errorHandler' : 'notFound';

      if ('function' === typeof app.classes[err]) {
        klass = new app.classes[err](app);

        if ('function' === typeof klass.exception) {
          klass.exception.apply(klass, [exception]);
        }
      }

      retval = defval;
    }

    return retval;
  };
