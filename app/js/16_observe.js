
  // event manager
  var observe = function (app, evt) {
    // listen to every event from root
    root.on(evt + '.action', '.js-action', function (e) {
      var key, action, handler, current, retval,
          data, el;

      for (key in app.router.currentHandlerInfos) {
        current = app.router.currentHandlerInfos[key].handler;

        if ('object' === typeof current.actions) {
          el = elem(e.currentTarget);
          data = el.data();

          for (action in current.actions) {
            handler = action.split('.')[0];

            if (data.action === handler && action.lastIndexOf('.' + evt) > 0) {
              retval = current[current.actions[action]].apply(current, [e, el, data]);
            }
          }
        }
      }

      // after all
      return retval;
    });
  };
