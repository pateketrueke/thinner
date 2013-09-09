//!(function (undefined) {
//!  'use strict';

  // shortcuts
  var Mohawk,

      win = this.window,
      doc = this.document,
      hist = win.history,
      popevents = [],
      modules = [],
      exception,
      running;

  // actions
  var events = ('touchstart touchmove touchend touchcancel keydown keyup keypress mousedown mouseup contextmenu ' +
                'click doubleclick mousemove focusin focusout mouseenter mouseleave submit input change ' +
                'dragstart drag dragenter dragleave dragover drop dragend').split(' '),
      root;

  // utils
  var slice = Array.prototype.slice;

  // self
  var global = this;
