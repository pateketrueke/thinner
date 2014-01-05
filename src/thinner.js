(function(undefined) {
  'use strict';

  // shortcuts
  var global = this,
      exception,
      running,
      root;


  // application config
  var settings = {
    el: '',
    log: null,
    listen: 'click doubleclick submit input change',
    context: global,
    router : null
  };


  include('helpers/util.js');
  include('helpers/debug.js');
  include('helpers/extend.js');
  include('helpers/handle.js');
  include('helpers/inflect.js');
  include('helpers/registry.js');
  include('helpers/url_params.js');

  include('router/broker.js');
  include('router/transform.js');
  include('router/delegate.js');
  include('router/dispose.js');
  include('router/grow.js');

  include('base/view.js');
  include('base/bind.js');
  include('base/scope.js');
  include('base/start.js');
  include('base/create.js');
  include('base/observe.js');
  include('base/popstate.js');
  include('base/methods.js');


  // expose
  if ('object' === typeof exports) {
    module.exports = thinner;
  } else if ('function' === typeof define && define.amd) {
    define([], function() { return thinner; });
  } else {
    this.thinner = thinner;
  }

}).call(this);
