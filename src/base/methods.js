
// loaded modules
var modules = [];

  // some isolation
var thinner = function(block) {
  modules.push(block);
};


// singleton
thinner.scope = function(config) {
  return loader(config);
};


// settings
thinner.setup = function(block) {
  var key,
      params = {};

  if ('function' === typeof block) {
    block = block.call(params, params);
    block = 'object' === typeof block ? block : params;
  }

  if ('object' === typeof block) {
    for (key in block) {
      settings[key] = block[key] || settings[key];
    }
  }

  return thinner;
};

// details
thinner.version = {
  major: $major,
  minor: $minor,
  micro: $micro,
  date: $date
};
