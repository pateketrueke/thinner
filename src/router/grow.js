
// handled methods on error
var try_catch = 'enter setup serialize'.split(' ');

// default hooks
var grow = function(from, handler) {
  var key;

  if (!('model' in handler)) {
    handler.model = proxy;
  }

  // delegate all event handlers
  if ('object' === typeof handler.events) {
    handler.events = handle(handler, handler.events);
  }

  handler.events = handler.events || {};
  handler.events.error = raise.call(handler, from, handler.events.error || undefined);

  // error handling (?)
  for (key in try_catch) {
    handler[try_catch[key]] = raise.call(handler, from, handler[try_catch[key]]);
  }
};
