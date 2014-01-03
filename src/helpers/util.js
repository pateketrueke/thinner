
// mixin for passing params
var proxy = function(params) { return params; };


// safe arrays
var slice = Array.prototype.slice;


// object length
var count = function(set) {
  var index,
      length = 0;

  for (index in set) {
    length += parseInt(set.hasOwnProperty(index), 10);
  }

  return length;
};
