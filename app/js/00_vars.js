//!(function (undefined) {
//!  'use strict';

  // shortcuts
  var Mohawk,

      global = this,

      win = this.window,
      doc = this.document,
      hist = win.history;


  // utils
  var slice = Array.prototype.slice,

      exception,
      running;


  // actions
  var events = ('touchstart touchmove touchend touchcancel keydown keyup keypress mousedown mouseup contextmenu ' +
                'click doubleclick mousemove focusin focusout mouseenter mouseleave submit input change ' +
                'dragstart drag dragenter dragleave dragover drop dragend').split(' ');

  // loaded modules
  var modules = [];


  // application config
  var settings = {
    el: 'body',
    listen: events
  };


  // ...
  var root;
