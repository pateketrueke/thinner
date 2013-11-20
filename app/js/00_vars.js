//!(function (undefined) {
//!  'use strict';

  // shortcuts
  var global = this,
      exception,
      running,

      win = this.window,
      doc = this.document,
      hist = win.history;


  // loaded modules
  var modules = [];


  // application config
  var settings = {
    el: 'body',
    log: null,
    listen: 'click doubleclick submit input change', // basics (?)
    templates: global.JST || {},
    router : null,
    $: null
  };


  // handled methods on error
  var methods = 'enter setup serialize'.split(' ');


  // ...
  var root;
