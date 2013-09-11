
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
          retval = klass.exception(exception);
        }
      } else {
        throw exception;
      }

      if (! defval) {
        throw retval || exception;
      }

      return defval;
    }

    return retval;
  };
