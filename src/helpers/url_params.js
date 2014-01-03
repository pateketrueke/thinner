
// normalize arguments for url()
var url_params = function(path, params, update) {
  if ('boolean' === typeof params) {
    update = params;
    params = undefined;
  }

  // history states
  if ('object' === typeof path) {
    params = path;
    path = params.to || undefined;

    delete params.to;
  }

  update = params && params.update || update;
  update = (2 === arguments.length) || update ? true : update;

  return [path, params || {}, update];
};
