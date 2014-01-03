
// event loop
var bind = function(on, set) {
  var events, evt;

  if (root) {
    root.off('**');
  }

  if (on) {
    // reset
    root = $(on);

    // listen all events
    events = 'string' === typeof set ? set.split(' ') : set;

    for (evt in events) {
      observe(running, events[evt]);
    }
  }
};
