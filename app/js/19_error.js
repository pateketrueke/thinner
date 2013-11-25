
  // error handler
  var error = function (app, block) {
    var retval, klass, err;

    try {
      retval = 'function' === typeof block && block();
    } catch (exception) {
      err = String(exception).indexOf('route not found') === -1 ? 'errorHandler' : 'notFound';

      debug(exception);

      if ('function' === typeof app.classes[err]) {
        klass = new app.classes[err]();

        // rethrow within possible
        if ('function' === typeof klass.exception) {
          klass.exception(exception);
        }
      }

      throw exception;
    }

    return retval;
  };
