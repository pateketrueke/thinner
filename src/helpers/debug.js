
// common logging
var debug = function(e) {
  if ('function' === typeof settings.log) {
    settings.log(e.stack ? [String(e), e.stack.replace(/^(?=\S)/mg, '  - ')].join('\n') : e);
  }
};


// error handler
var error = function(app, block) {
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


// event-error delegation
var raise = function(app, fn) {
  var self = this;

  return function() {
    var args = arguments;

    return error(app, function() {
      return 'function' === typeof fn && fn.apply(self, args);
    });
  };
};
