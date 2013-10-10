
  // common logging
  var debug = function (e) {
    if ('function' === typeof settings.log) {
      settings.log(e.stack ? [String(e), e.stack.replace(/^(?=\S)/mg, '  - ')].join('\n') : e);
    }
  };
