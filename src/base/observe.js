
// event manager
var observe = function(app, evt) {
  // listen to every event from root
  root.on(evt + '.action', '.js-action', function(e) {
    var key, action, handler, current, retval,
        data, el;

    for (key in app.router.currentHandlerInfos) {
      current = app.router.currentHandlerInfos[key].handler;

      if ('object' === typeof current.actions) {
        el = $(e.currentTarget);
        action = el.data('action');

        for (data in current.actions) {
          handler = data.split('.')[0];

          if (action === handler && data.lastIndexOf('.' + evt) > 0) {
            retval = raise.call(current, app, current[current.actions[data]])(e, el);
          }
        }
      }
    }

    // after all
    return retval;
  });
};
