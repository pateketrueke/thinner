
// remove handlers
var dispose = function(from, name, fn) {
  return function() {
    var retval = 'function' === typeof fn ? fn.apply(null, arguments) : undefined,
        partial;

    // delegated views (?)
    while (from.classes[name].partials.length) {
      partial = from.classes[name].partials.pop();
      from.handlers[name][partial]().view.teardown();
    }

    // only if can be created again
    delete from.handlers[name];

    return retval;
  };
};
