//!(function (undefined) {
//!  'use strict';

  // shortcuts
  var global = this,
      exception,
      running;


  // loaded modules
  var modules = [];


  // application config
  var settings = {
    el: '',
    log: null,
    listen: 'click doubleclick submit input change',
    templates: global.JST || {},
    context: global,
    router : null
  };


  // handled methods on error
  var methods = 'enter setup serialize'.split(' ');


  // ...
  var root;
