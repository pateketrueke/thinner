
  // all events
  var attach = function (evt, name) {
    var self = this;

    // initialize root
    root = root || (root = elem('body', doc));

    // delegate on other calls
    if (arguments.length > 2) {
      return root[evt].apply(root, slice.call(arguments, 1));
    }


    // listen to every event from root
    root.on(evt + '.action', '.js-action', function(e) {
      var target = elem(e.currentTarget),
          key = target.attr('data-action'),
          set = current.actions(),
          action, handler,
          retval;

      for (action in set) {
        handler = action.split('.')[0];

        if (key === handler && action.lastIndexOf('.' + evt) > 0) {
          retval = current[set[action]].apply(self.context, arguments);
        }

        return retval;
      }
    });
  };
