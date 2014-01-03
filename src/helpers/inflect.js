
// nice handlers
var camelize = function(str) {
  return str.replace(/[._-][a-z]/g, function($0) { return $0.substr(1).toUpperCase(); });
};


// nice names
var dasherize = function(str) {
  return str.replace(/[A-Z]/g, function($0) { return '-' + $0.toLowerCase(); });
};
