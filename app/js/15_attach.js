
  // all events
  var attach = function (evt) {
    return root[evt].apply(root, slice.call(arguments, 1));
  };
