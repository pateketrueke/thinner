
  // error handler
  var error = function (app, block, defval) {
    var retval, klass, err;

    try {
      retval = block() || defval;
    } catch (exception) {
      err = ('object' === typeof exception && 'isAborted' in exception) ? 'errorHandler' : 'notFound';

      if ('function' === typeof app.classes[err]) {
        klass = new app.classes[err](app);

        if ('function' === typeof klass.exception) {
          klass.exception(exception);
        }
      }

      if (! defval) {
        throw exception.message || exception;
      }

      return defval;
    }

    return retval;
  };
