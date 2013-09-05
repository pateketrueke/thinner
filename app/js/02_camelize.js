
  // nice handlers
  var camelize = function (str) {
    return str.replace(/([._-][a-z])/g, function ($1) { return $1.substr(1).toUpperCase(); });
  };
