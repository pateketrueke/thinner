
  // all events
  var attach = function (evt) {
    return function () {
      return root[evt].apply(root, arguments);
    };
  };
