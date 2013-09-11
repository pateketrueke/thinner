
  // error handler
  var error = function (app, block) {
    var retval, klass, err;

    try {
      retval = 'function' === typeof block && block();
    } catch (exception) {
      err = ('object' === typeof exception && 'isAborted' in exception) ? 'errorHandler' : 'notFound';

      if ('function' === typeof app.classes[err]) {
        klass = new app.classes[err](app);

        // rethrow within possible
        if ('function' === typeof klass.exception) {
          throw klass.exception(exception);
        }
      } else {
        throw exception;
      }
    }

    return retval;
  };
