//!(function (undefined) {
//!  'use strict';

  // shortcuts
  var Mohawk,

      global = this,
      exception,
      running,

      win = this.window,
      doc = this.document,
      hist = win.history;


  // utils
  var slice = Array.prototype.slice;


  // loaded modules
  var modules = [];


  // application config
  var settings = {
    el: 'body',
    listen: 'touchstart touchmove touchend touchcancel keydown keyup keypress mousedown mouseup contextmenu ' +
            'click doubleclick mousemove focusin focusout mouseenter mouseleave submit input change ' +
            'dragstart drag dragenter dragleave dragover drop dragend'
  };


  // ...
  var root;
