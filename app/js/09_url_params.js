
  // normalize arguments for url()
  var url_params = function (path, params, update) {
    if ('boolean' === typeof params) {
      update = params;
      params = undefined;
    }

    // history states
    if ('object' === typeof path) {
      params = path;
      path = params.to || undefined;
      params.locals = params.q || undefined;

      delete params.to;
      delete params.q;
    }


    update = params && params.update || update;
    update = null == update ? true : update;

    return [path, params || {}, update];
  };
