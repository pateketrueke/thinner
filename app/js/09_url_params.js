
  // normalize arguments for url()
  var url_params = function (app, path, params, update) {
    if ('boolean' === typeof params) {
      update = params;
      params = undefined;
    }

    if (String(path).charAt(0) !== '/') {
      path = app.context.url(path, params || {});
    }

    update = params && params.update || update;
    update = null == update ? true : update;

    return [path, params || {}, update];
  };
