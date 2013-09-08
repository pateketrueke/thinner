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
  var events = ('touchStart touchMove touchEnd touchCancel keyDown keyUp keyPress mouseDown mouseUp contextMenu ' +
                'click doubleClick mouseMove focusIn focusOut mouseEnter mouseLeave submit input change ' +
                'dragStart drag dragEnter dragLeave dragOver drop dragEnd').split(' '),
      current,
      root;

  // utils
  var slice = Array.prototype.slice;

  // self
  var global = this;
