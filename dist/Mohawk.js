(function(globals) {
var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name];
    if (!mod) {
      throw new Error("Module '" + name + "' not found.");
    }

    var deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();

define("rsvp/all",
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    
    var Promise = __dependency1__.Promise;
    /* global toString */


    function all(promises) {
      if (Object.prototype.toString.call(promises) !== "[object Array]") {
        throw new TypeError('You must pass an array to all.');
      }

      return new Promise(function(resolve, reject) {
        var results = [], remaining = promises.length,
        promise;

        if (remaining === 0) {
          resolve([]);
        }

        function resolver(index) {
          return function(value) {
            resolveAll(index, value);
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolver(i), reject);
          } else {
            resolveAll(i, promise);
          }
        }
      });
    }


    __exports__.all = all;
  });
define("rsvp/async",
  ["exports"],
  function(__exports__) {
    
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var async;

    // old node
    function useNextTick() {
      return function(callback, arg) {
        process.nextTick(function() {
          callback(arg);
        });
      };
    }

    // node >= 0.10.x
    function useSetImmediate() {
      return function(callback, arg) {
        /* global  setImmediate */
        setImmediate(function(){
          callback(arg);
        });
      };
    }

    function useMutationObserver() {
      var queue = [];

      var observer = new BrowserMutationObserver(function() {
        var toProcess = queue.slice();
        queue = [];

        toProcess.forEach(function(tuple) {
          var callback = tuple[0], arg= tuple[1];
          callback(arg);
        });
      });

      var element = document.createElement('div');
      observer.observe(element, { attributes: true });

      // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
      window.addEventListener('unload', function(){
        observer.disconnect();
        observer = null;
      }, false);

      return function(callback, arg) {
        queue.push([callback, arg]);
        element.setAttribute('drainQueue', 'drainQueue');
      };
    }

    function useSetTimeout() {
      return function(callback, arg) {
        setTimeout(function() {
          callback(arg);
        }, 1);
      };
    }

    if (typeof setImmediate === 'function') {
      async = useSetImmediate();
    } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      async = useNextTick();
    } else if (BrowserMutationObserver) {
      async = useMutationObserver();
    } else {
      async = useSetTimeout();
    }


    __exports__.async = async;
  });
define("rsvp/config",
  ["rsvp/async","exports"],
  function(__dependency1__, __exports__) {
    
    var async = __dependency1__.async;

    var config = {};
    config.async = async;


    __exports__.config = config;
  });
define("rsvp/defer",
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    
    var Promise = __dependency1__.Promise;

    function defer() {
      var deferred = {
        // pre-allocate shape
        resolve: undefined,
        reject:  undefined,
        promise: undefined
      };

      deferred.promise = new Promise(function(resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
      });

      return deferred;
    }


    __exports__.defer = defer;
  });
define("rsvp/events",
  ["exports"],
  function(__exports__) {
    
    var Event = function(type, options) {
      this.type = type;

      for (var option in options) {
        if (!options.hasOwnProperty(option)) { continue; }

        this[option] = options[option];
      }
    };

    var indexOf = function(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i][0] === callback) { return i; }
      }

      return -1;
    };

    var callbacksFor = function(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    };

    var EventTarget = {
      mixin: function(object) {
        object.on = this.on;
        object.off = this.off;
        object.trigger = this.trigger;
        return object;
      },

      on: function(eventNames, callback, binding) {
        var allCallbacks = callbacksFor(this), callbacks, eventName;
        eventNames = eventNames.split(/\s+/);
        binding = binding || this;

        while (eventName = eventNames.shift()) {
          callbacks = allCallbacks[eventName];

          if (!callbacks) {
            callbacks = allCallbacks[eventName] = [];
          }

          if (indexOf(callbacks, callback) === -1) {
            callbacks.push([callback, binding]);
          }
        }
      },

      off: function(eventNames, callback) {
        var allCallbacks = callbacksFor(this), callbacks, eventName, index;
        eventNames = eventNames.split(/\s+/);

        while (eventName = eventNames.shift()) {
          if (!callback) {
            allCallbacks[eventName] = [];
            continue;
          }

          callbacks = allCallbacks[eventName];

          index = indexOf(callbacks, callback);

          if (index !== -1) { callbacks.splice(index, 1); }
        }
      },

      trigger: function(eventName, options) {
        var allCallbacks = callbacksFor(this),
            callbacks, callbackTuple, callback, binding, event;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callbackTuple = callbacks[i];
            callback = callbackTuple[0];
            binding = callbackTuple[1];

            if (typeof options !== 'object') {
              options = { detail: options };
            }

            event = new Event(eventName, options);
            callback.call(binding, event);
          }
        }
      }
    };


    __exports__.EventTarget = EventTarget;
  });
define("rsvp/hash",
  ["rsvp/defer","exports"],
  function(__dependency1__, __exports__) {
    
    var defer = __dependency1__.defer;

    function size(object) {
      var s = 0;

      for (var prop in object) {
        s++;
      }

      return s;
    }

    function hash(promises) {
      var results = {}, deferred = defer(), remaining = size(promises);

      if (remaining === 0) {
        deferred.resolve({});
      }

      var resolver = function(prop) {
        return function(value) {
          resolveAll(prop, value);
        };
      };

      var resolveAll = function(prop, value) {
        results[prop] = value;
        if (--remaining === 0) {
          deferred.resolve(results);
        }
      };

      var rejectAll = function(error) {
        deferred.reject(error);
      };

      for (var prop in promises) {
        if (promises[prop] && typeof promises[prop].then === 'function') {
          promises[prop].then(resolver(prop), rejectAll);
        } else {
          resolveAll(prop, promises[prop]);
        }
      }

      return deferred.promise;
    }


    __exports__.hash = hash;
  });
define("rsvp/node",
  ["rsvp/promise","rsvp/all","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var Promise = __dependency1__.Promise;
    var all = __dependency2__.all;

    function makeNodeCallbackFor(resolve, reject) {
      return function (error, value) {
        if (error) {
          reject(error);
        } else if (arguments.length > 2) {
          resolve(Array.prototype.slice.call(arguments, 1));
        } else {
          resolve(value);
        }
      };
    }

    function denodeify(nodeFunc) {
      return function()  {
        var nodeArgs = Array.prototype.slice.call(arguments), resolve, reject;
        var thisArg = this;

        var promise = new Promise(function(nodeResolve, nodeReject) {
          resolve = nodeResolve;
          reject = nodeReject;
        });

        all(nodeArgs).then(function(nodeArgs) {
          nodeArgs.push(makeNodeCallbackFor(resolve, reject));

          try {
            nodeFunc.apply(thisArg, nodeArgs);
          } catch(e) {
            reject(e);
          }
        });

        return promise;
      };
    }


    __exports__.denodeify = denodeify;
  });
define("rsvp/promise",
  ["rsvp/config","rsvp/events","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var config = __dependency1__.config;
    var EventTarget = __dependency2__.EventTarget;

    function objectOrFunction(x) {
      return isFunction(x) || (typeof x === "object" && x !== null);
    }

    function isFunction(x){
      return typeof x === "function";
    }

    var Promise = function(resolver) {
      var promise = this,
      resolved = false;

      if (typeof resolver !== 'function') {
        throw new TypeError('You must pass a resolver function as the sole argument to the promise constructor');
      }

      if (!(promise instanceof Promise)) {
        return new Promise(resolver);
      }

      var resolvePromise = function(value) {
        if (resolved) { return; }
        resolved = true;
        resolve(promise, value);
      };

      var rejectPromise = function(value) {
        if (resolved) { return; }
        resolved = true;
        reject(promise, value);
      };

      this.on('promise:resolved', function(event) {
        this.trigger('success', { detail: event.detail });
      }, this);

      this.on('promise:failed', function(event) {
        this.trigger('error', { detail: event.detail });
      }, this);

      this.on('error', onerror);

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    };

    function onerror(event) {
      if (config.onerror) {
        config.onerror(event.detail);
      }
    }

    var invokeCallback = function(type, promise, callback, event) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(event.detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = event.detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (type === 'resolve') {
        resolve(promise, value);
      } else if (type === 'reject') {
        reject(promise, value);
      }
    };

    Promise.prototype = {
      constructor: Promise,

      isRejected: undefined,
      isFulfilled: undefined,
      rejectedReason: undefined,
      fulfillmentValue: undefined,

      then: function(done, fail) {
        this.off('error', onerror);

        var thenPromise = new this.constructor(function() {});

        if (this.isFulfilled) {
          config.async(function(promise) {
            invokeCallback('resolve', thenPromise, done, { detail: promise.fulfillmentValue });
          }, this);
        }

        if (this.isRejected) {
          config.async(function(promise) {
            invokeCallback('reject', thenPromise, fail, { detail: promise.rejectedReason });
          }, this);
        }

        this.on('promise:resolved', function(event) {
          invokeCallback('resolve', thenPromise, done, event);
        });

        this.on('promise:failed', function(event) {
          invokeCallback('reject', thenPromise, fail, event);
        });

        return thenPromise;
      },

      fail: function(fail) {
        return this.then(null, fail);
      }
    };

    EventTarget.mixin(Promise.prototype);

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function handleThenable(promise, value) {
      var then = null,
      resolved;

      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }

        if (objectOrFunction(value)) {
          then = value.then;

          if (isFunction(then)) {
            then.call(value, function(val) {
              if (resolved) { return true; }
              resolved = true;

              if (value !== val) {
                resolve(promise, val);
              } else {
                fulfill(promise, val);
              }
            }, function(val) {
              if (resolved) { return true; }
              resolved = true;

              reject(promise, val);
            });

            return true;
          }
        }
      } catch (error) {
        reject(promise, error);
        return true;
      }

      return false;
    }

    function fulfill(promise, value) {
      config.async(function() {
        promise.trigger('promise:resolved', { detail: value });
        promise.isFulfilled = true;
        promise.fulfillmentValue = value;
      });
    }

    function reject(promise, value) {
      config.async(function() {
        promise.trigger('promise:failed', { detail: value });
        promise.isRejected = true;
        promise.rejectedReason = value;
      });
    }


    __exports__.Promise = Promise;
  });
define("rsvp/reject",
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    
    var Promise = __dependency1__.Promise;

    function reject(reason) {
      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }


    __exports__.reject = reject;
  });
define("rsvp/resolve",
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    
    var Promise = __dependency1__.Promise;

    function resolve(thenable) {
      return new Promise(function(resolve, reject) {
        resolve(thenable);
      });
    }


    __exports__.resolve = resolve;
  });
define("rsvp",
  ["rsvp/events","rsvp/promise","rsvp/node","rsvp/all","rsvp/hash","rsvp/defer","rsvp/config","rsvp/resolve","rsvp/reject","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __exports__) {
    
    var EventTarget = __dependency1__.EventTarget;
    var Promise = __dependency2__.Promise;
    var denodeify = __dependency3__.denodeify;
    var all = __dependency4__.all;
    var hash = __dependency5__.hash;
    var defer = __dependency6__.defer;
    var config = __dependency7__.config;
    var resolve = __dependency8__.resolve;
    var reject = __dependency9__.reject;

    function configure(name, value) {
      config[name] = value;
    }


    __exports__.Promise = Promise;
    __exports__.EventTarget = EventTarget;
    __exports__.all = all;
    __exports__.hash = hash;
    __exports__.defer = defer;
    __exports__.denodeify = denodeify;
    __exports__.configure = configure;
    __exports__.resolve = resolve;
    __exports__.reject = reject;
  });
window.RSVP = requireModule("rsvp");
})(window);

/*
 * History API JavaScript Library v4.0.2
 *
 * Support: IE6+, FF3+, Opera 9+, Safari, Chrome and other
 *
 * Copyright 2011-2013, Dmitrii Pakhtinov ( spb.piksel@gmail.com )
 *
 * http://spb-piksel.ru/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Update: 16.07.13 00:47
 */
(function(window) {
    // Prevent the code from running if there is no window.history object
    if (!window.history) return;
    // symlink to document
    var document = window.document;
    // HTML element
    var documentElement = document.documentElement;
    // symlink to sessionStorage
    var sessionStorage = window['sessionStorage'];
    // symlink to constructor of Object
    var Object = window['Object'];
    // symlink to JSON Object
    var JSON = window['JSON'];
    // symlink to instance object of 'Location'
    var windowLocation = window.location;
    // symlink to instance object of 'History'
    var windowHistory = window.history;
    // new instance of 'History'. The default is a reference to the original object instance
    var historyObject = windowHistory;
    // symlink to method 'history.pushState'
    var historyPushState = windowHistory.pushState;
    // symlink to method 'history.replaceState'
    var historyReplaceState = windowHistory.replaceState;
    // if the browser supports HTML5-History-API
    var isSupportHistoryAPI = !!historyPushState;
    // verifies the presence of an object 'state' in interface 'History'
    var isSupportStateObjectInHistory = 'state' in windowHistory;
    // symlink to method 'Object.defineProperty'
    var defineProperty = Object.defineProperty;
    // new instance of 'Location', for IE8 will use the element HTMLAnchorElement, instead of pure object
    var locationObject = redefineProperty({}, 't') ? {} : document.createElement('a');
    // prefix for the names of events
    var eventNamePrefix = '';
    // String that will contain the name of the method
    var addEventListenerName = window.addEventListener ? 'addEventListener' : (eventNamePrefix = 'on') && 'attachEvent';
    // String that will contain the name of the method
    var removeEventListenerName = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
    // String that will contain the name of the method
    var dispatchEventName = window.dispatchEvent ? 'dispatchEvent' : 'fireEvent';
    // reference native methods for the events
    var addEvent = window[addEventListenerName];
    var removeEvent = window[removeEventListenerName];
    var dispatch = window[dispatchEventName];
    // default settings
    var settings = {"basepath": '/', "redirect": 0, "type": '/'};
    // key for the sessionStorage
    var sessionStorageKey = '__historyAPI__';
    // Anchor Element for parseURL function
    var anchorElement = document.createElement('a');
    // last URL before change to new URL
    var lastURL = windowLocation.href;
    // Control URL, need to fix the bug in Opera
    var checkUrlForPopState = '';
    // trigger event 'onpopstate' on page load
    var isFireInitialState = false;
    // store a list of 'state' objects in the current session
    var stateStorage = {};
    // in this object will be stored custom handlers
    var eventsList = {};

    /**
     * Properties that will be replaced in the global
     * object 'window', to prevent conflicts
     *
     * @type {Object}
     */
    var eventsDescriptors = {
        "onhashchange": null,
        "onpopstate": null
    };

    /**
     * Properties that will be replaced/added to object
     * 'window.history', includes the object 'history.location',
     * for a complete the work with the URL address
     *
     * @type {Object}
     */
    var historyDescriptors = {
        /**
         * @namespace history
         * @param {String} [type]
         * @param {String} [basepath]
         */
        "redirect": function(type, basepath) {
            settings["basepath"] = basepath = basepath == null ? settings["basepath"] : basepath;
            settings["type"] = type = type == null ? settings["type"] : type;
            if (window.top == window.self) {
                var relative = parseURL(null, false, true)._relative;
                var path = windowLocation.pathname + windowLocation.search;
                if (isSupportHistoryAPI) {
                    path = path.replace(/([^\/])$/, '$1/');
                    if (relative != basepath && (new RegExp("^" + basepath + "$", "i")).test(path)) {
                        windowLocation.replace(relative);
                    }
                } else if (path != basepath) {
                    path = path.replace(/([^\/])\?/, '$1/?');
                    if ((new RegExp("^" + basepath, "i")).test(path)) {
                        windowLocation.replace(basepath + '#' + path.
                            replace(new RegExp("^" + basepath, "i"), type) + windowLocation.hash);
                    }
                }
            }
        },
        /**
         * The method adds a state object entry
         * to the history.
         *
         * @namespace history
         * @param {Object} state
         * @param {string} title
         * @param {string} [url]
         */
        pushState: function(state, title, url) {
            historyPushState && historyPushState.apply(windowHistory, arguments);
            changeState(state, url);
        },
        /**
         * The method updates the state object,
         * title, and optionally the URL of the
         * current entry in the history.
         *
         * @namespace history
         * @param {Object} state
         * @param {string} title
         * @param {string} [url]
         */
        replaceState: function(state, title, url) {
            delete stateStorage[windowLocation.href];
            historyReplaceState && historyReplaceState.apply(windowHistory, arguments);
            changeState(state, url, true);
        },
        /**
         * Object 'history.location' is similar to the
         * object 'window.location', except that in
         * HTML4 browsers it will behave a bit differently
         *
         * @namespace history
         */
        "location": {
            set: function(value) {
                window.location = value;
            },
            get: function() {
                return isSupportHistoryAPI ? windowLocation : locationObject;
            }
        },
        /**
         * A state object is an object representing
         * a user interface state.
         *
         * @namespace history
         */
        "state": {
            get: function() {
                return stateStorage[windowLocation.href] || null;
            }
        }
    };

    /**
     * Properties for object 'history.location'.
     * Object 'history.location' is similar to the
     * object 'window.location', except that in
     * HTML4 browsers it will behave a bit differently
     *
     * @type {Object}
     */
    var locationDescriptors = {
        /**
         * Navigates to the given page.
         *
         * @namespace history.location
         */
        assign: function(url) {
            if (('' + url).indexOf('#') === 0) {
                changeState(null, url);
            } else {
                windowLocation.assign(url);
            }
        },
        /**
         * Reloads the current page.
         *
         * @namespace history.location
         */
        reload: function() {
            windowLocation.reload();
        },
        /**
         * Removes the current page from
         * the session history and navigates
         * to the given page.
         *
         * @namespace history.location
         */
        replace: function(url) {
            if (('' + url).indexOf('#') === 0) {
                changeState(null, url, true);
            } else {
                windowLocation.replace(url);
            }
        },
        /**
         * Returns the current page's location.
         *
         * @namespace history.location
         */
        toString: function() {
            return this.href;
        },
        /**
         * Returns the current page's location.
         * Can be set, to navigate to another page.
         *
         * @namespace history.location
         */
        "href": {
            get: function() {
                return parseURL()._href;
            }
        },
        /**
         * Returns the current page's protocol.
         *
         * @namespace history.location
         */
        "protocol": null,
        /**
         * Returns the current page's host and port number.
         *
         * @namespace history.location
         */
        "host": null,
        /**
         * Returns the current page's host.
         *
         * @namespace history.location
         */
        "hostname": null,
        /**
         * Returns the current page's port number.
         *
         * @namespace history.location
         */
        "port": null,
        /**
         * Returns the current page's path only.
         *
         * @namespace history.location
         */
        "pathname": {
            get: function() {
                return parseURL()._pathname;
            }
        },
        /**
         * Returns the current page's search
         * string, beginning with the character
         * '?' and to the symbol '#'
         *
         * @namespace history.location
         */
        "search": {
            get: function() {
                return parseURL()._search;
            }
        },
        /**
         * Returns the current page's hash
         * string, beginning with the character
         * '#' and to the end line
         *
         * @namespace history.location
         */
        "hash": {
            set: function(value) {
                changeState(null, ('' + value).replace(/^(#|)/, '#'), false, lastURL);
            },
            get: function() {
                return parseURL()._hash;
            }
        }
    };

    /**
     * Just empty function
     *
     * @return void
     */
    function emptyFunction() {
        // dummy
    }

    /**
     * Prepares a parts of the current or specified reference for later use in the library
     *
     * @param {string} [href]
     * @param {boolean} [isWindowLocation]
     * @param {boolean} [isNotAPI]
     * @return {Object}
     */
    function parseURL(href, isWindowLocation, isNotAPI) {
        var re = /(?:([\w0-9]+:))?(?:\/\/(?:[^@]*@)?([^\/:\?#]+)(?::([0-9]+))?)?([^\?#]*)(?:(\?[^#]+)|\?)?(?:(#.*))?/;
        if (href && !isWindowLocation) {
            var current = parseURL(), _pathname = current._pathname, _protocol = current._protocol;
            // convert relative link to the absolute
            href = /^(?:[\w0-9]+\:)?\/\//.test(href) ? href.indexOf("/") === 0
                ? _protocol + href : href : _protocol + "//" + current._host + (
                href.indexOf("/") === 0 ? href : href.indexOf("?") === 0
                    ? _pathname + href : href.indexOf("#") === 0
                    ? _pathname + current._search + href : _pathname.replace(/[^\/]+$/g, '') + href
                );
        } else {
            href = isWindowLocation ? href : windowLocation.href;
            // if current browser not support History-API
            if (!isSupportHistoryAPI || isNotAPI) {
                // get hash fragment
                href = href.replace(/^[^#]*/, '') || "#";
                // form the absolute link from the hash
                href = windowLocation.protocol + '//' + windowLocation.host + settings['basepath']
                    + href.replace(new RegExp("^#[\/]?(?:" + settings["type"] + ")?"), "");
            }
        }
        // that would get rid of the links of the form: /../../
        anchorElement.href = href;
        // decompose the link in parts
        var result = re.exec(anchorElement.href);
        // host name with the port number
        var host = result[2] + (result[3] ? ':' + result[3] : '');
        // folder
        var pathname = result[4] || '/';
        // the query string
        var search = result[5] || '';
        // hash
        var hash = result[6] === '#' ? '' : (result[6] || '');
        // relative link, no protocol, no host
        var relative = pathname + search + hash;
        // special links for set to hash-link, if browser not support History API
        var nohash = pathname.replace(new RegExp("^" + settings["basepath"], "i"), settings["type"]) + search;
        // result
        return {
            _href: result[1] + '//' + host + relative,
            _protocol: result[1],
            _host: host,
            _hostname: result[2],
            _port: result[3] || '',
            _pathname: pathname,
            _search: search,
            _hash: hash,
            _relative: relative,
            _nohash: nohash,
            _special: nohash + hash
        }
    }

    /**
     * Initializing storage for the custom state's object
     */
    function storageInitialize(JSON) {
        var storage = '';
        if (sessionStorage) {
            // get cache from the storage in browser
            storage += sessionStorage.getItem(sessionStorageKey);
        } else {
            var cookie = document.cookie.split(sessionStorageKey + "=");
            if (cookie.length > 1) {
                storage += (cookie.pop().split(";").shift() || 'null');
            }
        }
        try {
            stateStorage = JSON.parse(storage) || {};
        } catch(_e_) {
            stateStorage = {};
        }
        // hang up the event handler to event unload page
        addEvent(eventNamePrefix + 'unload', function() {
            if (sessionStorage) {
                // save current state's object
                sessionStorage.setItem(sessionStorageKey, JSON.stringify(stateStorage));
            } else {
                // save the current 'state' in the cookie
                var state = {};
                if (state[windowLocation.href] = historyObject.state) {
                    document.cookie = sessionStorageKey + '=' + JSON.stringify(state);
                }
            }
        }, false);
    }

    /**
     * This method is implemented to override the built-in(native)
     * properties in the browser, unfortunately some browsers are
     * not allowed to override all the properties and even add.
     * For this reason, this was written by a method that tries to
     * do everything necessary to get the desired result.
     *
     * @param {Object} object The object in which will be overridden/added property
     * @param {String} prop The property name to be overridden/added
     * @param {Object} [descriptor] An object containing properties set/get
     * @param {Function} [onWrapped] The function to be called when the wrapper is created
     * @return {Object|Boolean} Returns an object on success, otherwise returns false
     */
    function redefineProperty(object, prop, descriptor, onWrapped) {
        // test only if descriptor is undefined
        descriptor = descriptor || {set: emptyFunction};
        // variable will have a value of true the success of attempts to set descriptors
        var isDefinedSetter = !descriptor.set;
        var isDefinedGetter = !descriptor.get;
        // for tests of attempts to set descriptors
        var test = {configurable: true, set: function() {
            isDefinedSetter = 1;
        }, get: function() {
            isDefinedGetter = 1;
        }};

        try {
            // testing for the possibility of overriding/adding properties
            defineProperty(object, prop, test);
            // running the test
            object[prop] = object[prop];
            // attempt to override property using the standard method
            defineProperty(object, prop, descriptor);
        } catch(_e_) {
        }

        // If the variable 'isDefined' has a false value, it means that need to try other methods
        if (!isDefinedSetter || !isDefinedGetter) {
            // try to override/add the property, using deprecated functions
            if (object.__defineGetter__) {
                // testing for the possibility of overriding/adding properties
                object.__defineGetter__(prop, test.get);
                object.__defineSetter__(prop, test.set);
                // running the test
                object[prop] = object[prop];
                // attempt to override property using the deprecated functions
                descriptor.get && object.__defineGetter__(prop, descriptor.get);
                descriptor.set && object.__defineSetter__(prop, descriptor.set);
            }

            // Browser refused to override the property, using the standard and deprecated methods
            if ((!isDefinedSetter || !isDefinedGetter) && object === window) {
                try {
                    // save original value from this property
                    var originalValue = object[prop];
                    // set null to built-in(native) property
                    object[prop] = null;
                } catch(_e_) {
                }
                // This rule for Internet Explorer 8
                if ('execScript' in window) {
                    /**
                     * to IE8 override the global properties using
                     * VBScript, declaring it in global scope with
                     * the same names.
                     */
                    window['execScript']('Public ' + prop, 'VBScript');
                } else {
                    try {
                        /**
                         * This hack allows to override a property
                         * with the set 'configurable: false', working
                         * in the hack 'Safari' to 'Mac'
                         */
                        defineProperty(object, prop, {value: emptyFunction});
                    } catch(_e_) {
                    }
                }
                // set old value to new variable
                object[prop] = originalValue;

            } else if (!isDefinedSetter || !isDefinedGetter) {
                // the last stage of trying to override the property
                try {
                    try {
                        // wrap the object in a new empty object
                        var temp = Object.create(object);
                        defineProperty(Object.getPrototypeOf(temp) === object ? temp : object, prop, descriptor);
                        for(var key in object) {
                            // need to bind a function to the original object
                            if (typeof object[key] === 'function') {
                                temp[key] = object[key].bind(object);
                            }
                        }
                        try {
                            // to run a function that will inform about what the object was to wrapped
                            onWrapped.call(temp, temp, object);
                        } catch(_e_) {
                        }
                        object = temp;
                    } catch(_e_) {
                        // sometimes works override simply by assigning the prototype property of the constructor
                        defineProperty(object.constructor.prototype, prop, descriptor);
                    }
                } catch(_e_) {
                    // all methods have failed
                    return false;
                }
            }
        }

        return object;
    }

    /**
     * Adds the missing property in descriptor
     *
     * @param {Object} object An object that stores values
     * @param {String} prop Name of the property in the object
     * @param {Object|null} descriptor Descriptor
     * @return {Object} Returns the generated descriptor
     */
    function prepareDescriptorsForObject(object, prop, descriptor) {
        descriptor = descriptor || {};
        // the default for the object 'location' is the standard object 'window.location'
        object = object === locationDescriptors ? windowLocation : object;
        // setter for object properties
        descriptor.set = (descriptor.set || function(value) {
            object[prop] = value;
        });
        // getter for object properties
        descriptor.get = (descriptor.get || function() {
            return object[prop];
        });
        return descriptor;
    }

    /**
     * Wrapper for the methods 'addEventListener/attachEvent' in the context of the 'window'
     *
     * @param {String} event The event type for which the user is registering
     * @param {Function} listener The method to be called when the event occurs.
     * @param {Boolean} capture If true, capture indicates that the user wishes to initiate capture.
     * @return void
     */
    function addEventListener(event, listener, capture) {
        if (event in eventsList) {
            // here stored the event listeners 'popstate/hashchange'
            eventsList[event].push(listener);
        } else {
            // FireFox support non-standart four argument aWantsUntrusted
            // https://github.com/devote/HTML5-History-API/issues/13
            if (arguments.length > 3) {
                addEvent(event, listener, capture, arguments[3]);
            } else {
                addEvent(event, listener, capture);
            }
        }
    }

    /**
     * Wrapper for the methods 'removeEventListener/detachEvent' in the context of the 'window'
     *
     * @param {String} event The event type for which the user is registered
     * @param {Function} listener The parameter indicates the Listener to be removed.
     * @param {Boolean} capture Was registered as a capturing listener or not.
     * @return void
     */
    function removeEventListener(event, listener, capture) {
        var list = eventsList[event];
        if (list) {
            for(var i = list.length; --i;) {
                if (list[i] === listener) {
                    list.splice(i, 1);
                    break;
                }
            }
        } else {
            removeEvent(event, listener, capture);
        }
    }

    /**
     * Wrapper for the methods 'dispatchEvent/fireEvent' in the context of the 'window'
     *
     * @param {Event|String} event Instance of Event or event type string if 'eventObject' used
     * @param {*} [eventObject] For Internet Explorer 8 required event object on this argument
     * @return {Boolean} If 'preventDefault' was called the value is false, else the value is true.
     */
    function dispatchEvent(event, eventObject) {
        var eventType = ('' + (typeof event === "string" ? event : event.type)).replace(/^on/, '');
        var list = eventsList[eventType];
        if (list) {
            // need to understand that there is one object of Event
            eventObject = typeof event === "string" ? eventObject : event;
            if (eventObject.target == null) {
                // need to override some of the properties of the Event object
                for(var props = ['target', 'currentTarget', 'srcElement', 'type']; event = props.pop();) {
                    // use 'redefineProperty' to override the properties
                    eventObject = redefineProperty(eventObject, event, {
                        get: event === 'type' ? function() {
                            return eventType;
                        } : function() {
                            return window;
                        }
                    });
                }
            }
            // run function defined in the attributes 'onpopstate/onhashchange' in the 'window' context
            ((eventType === 'popstate' ? window.onpopstate : window.onhashchange)
                || emptyFunction).call(window, eventObject);
            // run other functions that are in the list of handlers
            for(var i = 0, len = list.length; i < len; i++) {
                list[i].call(window, eventObject);
            }
            return true;
        } else {
            return dispatch(event, eventObject);
        }
    }

    /**
     * dispatch current state event
     */
    function firePopState() {
        var o = document.createEvent ? document.createEvent('Event') : document.createEventObject();
        if (o.initEvent) {
            o.initEvent('popstate', false, false);
        } else {
            o.type = 'popstate';
        }
        o.state = historyObject.state;
        // send a newly created events to be processed
        dispatchEvent(o);
    }

    /**
     * fire initial state for non-HTML5 browsers
     */
    function fireInitialState() {
        if (isFireInitialState) {
            isFireInitialState = false;
            firePopState();
        }
    }

    /**
     * Change the data of the current history for HTML4 browsers
     *
     * @param {Object} state
     * @param {string} [url]
     * @param {Boolean} [replace]
     * @param {string} [lastURLValue]
     * @return void
     */
    function changeState(state, url, replace, lastURLValue) {
        if (!isSupportHistoryAPI) {
            // normalization url
            var urlObject = parseURL(url);
            // if current url not equal new url
            if (urlObject._relative !== parseURL()._relative) {
                // if empty lastURLValue to skip hash change event
                lastURL = lastURLValue;
                if (replace) {
                    // only replace hash, not store to history
                    windowLocation.replace("#" + urlObject._special);
                } else {
                    // change hash and add new record to history
                    windowLocation.hash = urlObject._special;
                }
            }
        }
        if (!isSupportStateObjectInHistory && state) {
            stateStorage[windowLocation.href] = state;
        }
        isFireInitialState = false;
    }

    /**
     * Event handler function changes the hash in the address bar
     *
     * @param {Event} event
     * @return void
     */
    function onHashChange(event) {
        // if not empty lastURL, otherwise skipped the current handler event
        if (lastURL) {
            // if checkUrlForPopState equal current url, this means that the event was raised popstate browser
            if (checkUrlForPopState !== windowLocation.href) {
                // otherwise,
                // the browser does not support popstate event or just does not run the event by changing the hash.
                firePopState();
            }
            // current event object
            event = event || window.event;

            var oldURLObject = parseURL(lastURL, true);
            var newURLObject = parseURL();
            // HTML4 browser not support properties oldURL/newURL
            if (!event.oldURL) {
                event.oldURL = oldURLObject._href;
                event.newURL = newURLObject._href;
            }
            if (oldURLObject._hash !== newURLObject._hash) {
                // if current hash not equal previous hash
                dispatchEvent(event);
            }
        }
        // new value to lastURL
        lastURL = windowLocation.href;
    }

    /**
     * The event handler is fully loaded document
     *
     * @param {*} [noScroll]
     * @return void
     */
    function onLoad(noScroll) {
        // Get rid of the events popstate when the first loading a document in the webkit browsers
        setTimeout(function() {
            // hang up the event handler for the built-in popstate event in the browser
            addEvent('popstate', function(e) {
                // set the current url, that suppress the creation of the popstate event by changing the hash
                checkUrlForPopState = windowLocation.href;
                // for Safari browser in OS Windows not implemented 'state' object in 'History' interface
                // and not implemented in old HTML4 browsers
                if (!isSupportStateObjectInHistory) {
                    e = redefineProperty(e, 'state', {get: function() {
                        return historyObject.state;
                    }});
                }
                // send events to be processed
                dispatchEvent(e);
            }, false);
        }, 0);
        // for non-HTML5 browsers
        if (!isSupportHistoryAPI && noScroll !== true && historyObject.location) {
            // scroll window to anchor element
            scrollToAnchorId(historyObject.location.hash);
            // fire initial state for non-HTML5 browser after load page
            fireInitialState();
        }
    }

    /**
     * handler url with anchor for non-HTML5 browsers
     *
     * @param e
     */
    function onAnchorClick(e) {
        var event = e || window.event;
        var target = event.target || event.srcElement;
        var defaultPrevented = "defaultPrevented" in event ? event['defaultPrevented'] : event.returnValue === false;
        if (target && target.nodeName === "A" && !defaultPrevented) {
            var current = parseURL();
            var expect = parseURL(target.getAttribute("href", 2));
            var isEqualBaseURL = current._href.split('#').shift() === expect._href.split('#').shift();
            if (isEqualBaseURL) {
                if (current._hash !== expect._hash) {
                    historyObject.location.hash = expect._hash;
                }
                scrollToAnchorId(expect._hash);
                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
            }
        }
    }

    /**
     * Scroll page to current anchor in url-hash
     *
     * @param hash
     */
    function scrollToAnchorId(hash) {
        var target = document.getElementById(hash = (hash || '').replace(/^#/, ''));
        if (target && target.id === hash && target.nodeName === "A") {
            var rect = target.getBoundingClientRect();
            window.scrollTo((documentElement.scrollLeft || 0), rect.top + (documentElement.scrollTop || 0)
                - (documentElement.clientTop || 0));
        }
    }

    /**
     * Library initialization
     *
     * @return {Boolean} return true if all is well, otherwise return false value
     */
    function initialize() {
        /**
         * Get custom settings from the query string
         */
        var scripts = document.getElementsByTagName('script');
        var src = (scripts[scripts.length - 1] || {}).src || '';
        var arg = src.indexOf('?') !== -1 ? src.split('?').pop() : '';
        arg.replace(/(\w+)(?:=([^&]*))?/g, function(a, key, value) {
            settings[key] = (value || (key === 'basepath' ? '/' : '')).replace(/^(0|false)$/, '');
        });

        /**
         * Includes support for IE6+
         */
        ie6DriverStart();

        /**
         * hang up the event handler to listen to the events hashchange
         */
        addEvent(eventNamePrefix + 'hashchange', onHashChange, false);

        // a list of objects with pairs of descriptors/object
        var data = [locationDescriptors, locationObject, eventsDescriptors, window, historyDescriptors, historyObject];

        // if browser support object 'state' in interface 'History'
        if (isSupportStateObjectInHistory) {
            // remove state property from descriptor
            delete historyDescriptors['state'];
        }

        // initializing descriptors
        for(var i = 0; i < data.length; i += 2) {
            for(var prop in data[i]) {
                if (data[i].hasOwnProperty(prop)) {
                    if (typeof data[i][prop] === 'function') {
                        // If the descriptor is a simple function, simply just assign it an object
                        data[i + 1][prop] = data[i][prop];
                    } else {
                        // prepare the descriptor the required format
                        var descriptor = prepareDescriptorsForObject(data[i], prop, data[i][prop]);
                        // try to set the descriptor object
                        if (!redefineProperty(data[i + 1], prop, descriptor, function(n, o) {
                            // is satisfied if the failed override property
                            if (o === historyObject) {
                                // the problem occurs in Safari on the Mac
                                window.history = historyObject = data[i + 1] = n;
                            }
                        })) {
                            // if there is no possibility override.
                            // This browser does not support descriptors, such as IE7

                            // remove previously hung event handlers
                            removeEvent(eventNamePrefix + 'hashchange', onHashChange, false);

                            // fail to initialize :(
                            return false;
                        }

                        // create a repository for custom handlers onpopstate/onhashchange
                        if (data[i + 1] === window) {
                            eventsList[prop] = eventsList[prop.substr(2)] = [];
                        }
                    }
                }
            }
        }

        // redirect if necessary
        if (settings['redirect']) {
            historyObject['redirect']();
        }

        // If browser does not support object 'state' in interface 'History'
        if (!isSupportStateObjectInHistory && JSON) {
            storageInitialize(JSON);
        }

        // track clicks on anchors
        if (!isSupportHistoryAPI) {
            document[addEventListenerName](eventNamePrefix + "click", onAnchorClick, false);
        }

        if (document.readyState === 'complete') {
            onLoad(true);
        } else {
            if (!isSupportHistoryAPI && parseURL()._relative !== settings["basepath"]) {
                isFireInitialState = true;
            }
            /**
             * Need to avoid triggering events popstate the initial page load.
             * Hang handler popstate as will be fully loaded document that
             * would prevent triggering event onpopstate
             */
            addEvent(eventNamePrefix + 'load', onLoad, false);
        }

        // everything went well
        return true;
    }

    /**
     * Starting the library
     */
    if (!initialize()) {
        // if unable to initialize descriptors
        // therefore quite old browser and there
        // is no sense to continue to perform
        return;
    }

    /**
     * If the property history.emulate will be true,
     * this will be talking about what's going on
     * emulation capabilities HTML5-History-API.
     * Otherwise there is no emulation, ie the
     * built-in browser capabilities.
     *
     * @type {boolean}
     * @const
     */
    historyObject['emulate'] = !isSupportHistoryAPI;

    /**
     * Replace the original methods on the wrapper
     */
    window[addEventListenerName] = addEventListener;
    window[removeEventListenerName] = removeEventListener;
    window[dispatchEventName] = dispatchEvent;

    // ====================================================================================== //
    // Driver for IE6+ or below
    // ====================================================================================== //
    function ie6DriverStart() {
        /**
         * Creates a static object
         *
         * @param object
         * @returns {*}
         */
        function createVBObjects(object) {
            var properties = [];
            var className = 'VBHistoryClass' + (new Date()).getTime() + msie++;
            var staticClassParts = ["Class " + className];
            for(var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    var value = object[prop];
                    if (value && (value.get || value.set)) {
                        if (value.get) {
                            staticClassParts.push(
                                'Public ' + (prop === '_' ? 'Default ' : '') + 'Property Get [' + prop + ']',
                                'Call VBCVal([(accessors)].[' + prop + '].get.call(me),[' + prop + '])',
                                'End Property'
                            );
                        }
                        if (value.set) {
                            staticClassParts.push('Public Property Let [' + prop + '](val)',
                                (value = 'Call [(accessors)].[' + prop + '].set.call(me,val)\nEnd Property'),
                                'Public Property Set [' + prop + '](val)', value);
                        }
                    } else {
                        properties.push(prop);
                        staticClassParts.push('Public [' + prop + ']');
                    }
                }
            }
            staticClassParts.push(
                'Private [(accessors)]',
                'Private Sub Class_Initialize()',
                'Set [(accessors)]=' + className + 'FactoryJS()',
                'End Sub',
                'End Class',
                'Function ' + className + 'Factory()',
                'Set ' + className + 'Factory=New ' + className,
                'End Function'
            );
            window['execScript'](staticClassParts.join('\n'), 'VBScript');
            window[className + 'FactoryJS'] = function() {
                return object;
            };
            var result = window[className + 'Factory']();
            for(var i = 0; i < properties.length; i++) {
                result[properties[i]] = object[properties[i]];
            }
            return result;
        }

        /**
         * Escape special symbols
         *
         * @param string
         * @returns {string}
         */
        function quote(string) {
            var escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
            var meta = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\'};
            return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
                return a in meta ? meta[a] : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }

        // testing IE browser
        var msie = window['eval'] && eval("/*@cc_on 1;@*/");
        if (!msie || +((/msie (\d+)/i.exec(navigator.userAgent) || [, 8])[1]) > 7) {
            // If it is not IE or a version greater than seven
            return;
        }

        // save original links to methods
        var originalChangeState = changeState;
        var originalRedefineProperty = redefineProperty;
        var currentHref = parseURL()._href;
        var iFrame = document.createElement('iframe');

        // insert IFRAME element to DOM
        iFrame.src = "javascript:true;";
        iFrame = documentElement.firstChild.appendChild(iFrame).contentWindow;

        // correction value for VB Script
        window['execScript'](
            'Public history\nFunction VBCVal(o,r) If IsObject(o) Then Set r=o Else r=o End If End Function',
            'VBScript'
        );

        // renew standard object
        locationObject = {"_": {get: locationDescriptors.toString}};
        historyObject = {
            // properties to create an object in IE
            "back": windowHistory.back,
            "forward": windowHistory.forward,
            "go": windowHistory.go,
            "emulate": null,
            "_": {get: function() {
                return '[object History]';
            }}
        };

        JSON = {
            /**
             * Analogue of JSON.parse()
             *
             * @param value
             * @returns {*}
             */
            "parse": function(value) {
                try {
                    return new Function('', 'return ' + value)();
                } catch(_e_) {
                    return null;
                }
            },
            /**
             * Analogue of JSON.stringify()
             *
             * @param value
             * @returns {*}
             */
            "stringify": function(value) {
                var n = (typeof value).charCodeAt(2);
                return n === 114 ? quote(value) : n === 109 ? isFinite(value) ? String(value) : 'null' : n === 111 || n
                    === 108 ? String(value) : n === 106 ? !value ? 'null' : (function(isArray) {
                    var out = isArray ? '[' : '{';
                    if (isArray) {
                        for(var i = 0; i < value.length; i++) {
                            out += (i == 0 ? "" : ",") + JSON.stringify(value[i]);
                        }
                    } else {
                        for(var k in value) {
                            if (value.hasOwnProperty(k)) {
                                out += (out.length == 1 ? "" : ",") + quote(k) + ":" + JSON.stringify(value[k]);
                            }
                        }
                    }
                    return out + (isArray ? ']' : '}');
                })(Object.prototype.toString.call(value) === '[object Array]') : 'void 0';
            }
        };

        /**
         * Change the data of the current history for IE6+
         */
        changeState = function(state, url, replace, lastURLValue, lfirst) {
            var iFrameDocument = iFrame.document;
            var urlObject = parseURL(url);
            isFireInitialState = false;
            if (urlObject._relative === parseURL()._relative && !lfirst) {
                if (state) {
                    stateStorage[windowLocation.href] = state;
                }
                return;
            }
            lastURL = lastURLValue;
            if (replace) {
                if (iFrame["lfirst"]) {
                    history.back();
                    changeState(state, urlObject._href, 0, lastURLValue, 1);
                } else {
                    windowLocation.replace("#" + urlObject._special);
                }
            } else if (urlObject._href != currentHref || lfirst) {
                if (!iFrame['lfirst']) {
                    iFrame["lfirst"] = 1;
                    changeState(state, currentHref, 0, lastURLValue, 1);
                }
                iFrameDocument.open();
                iFrameDocument.write('\x3Cscript\x3Elfirst=1;parent.location.hash="'
                    + urlObject._special.replace(/"/g, '\\"') + '";\x3C/script\x3E');
                iFrameDocument.close();
            }
            if (!lfirst && state) {
                stateStorage[windowLocation.href] = state;
            }
        };

        /**
         * See original method
         */
        redefineProperty = function(object, prop, descriptor, onWrapped) {
            if (!originalRedefineProperty.apply(this, arguments)) {
                if (object === locationObject) {
                    locationObject[prop] = descriptor;
                } else if (object === historyObject) {
                    historyObject[prop] = descriptor;
                    if (prop === 'state') {
                        locationObject = createVBObjects(locationObject);
                        window.history = historyObject = createVBObjects(historyObject);
                    }
                } else {
                    object[prop] = descriptor.get && descriptor.get();
                }
            }
            return object;
        };

        /**
         * Tracking changes in the hash in the address bar
         */
        var interval = setInterval(function() {
            var href = parseURL()._href;
            if (href != currentHref) {
                var e = document.createEventObject();
                e.oldURL = currentHref;
                e.newURL = currentHref = href;
                e.type = 'hashchange';
                onHashChange(e);
            }
        }, 100);

        window['JSON'] = JSON;
    }
})(window);
(function(exports) {
  
  var specials = [
    '/', '.', '*', '+', '?', '|',
    '(', ')', '[', ']', '{', '}', '\\'
  ];

  var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

  // A Segment represents a segment in the original route description.
  // Each Segment type provides an `eachChar` and `regex` method.
  //
  // The `eachChar` method invokes the callback with one or more character
  // specifications. A character specification consumes one or more input
  // characters.
  //
  // The `regex` method returns a regex fragment for the segment. If the
  // segment is a dynamic of star segment, the regex fragment also includes
  // a capture.
  //
  // A character specification contains:
  //
  // * `validChars`: a String with a list of all valid characters, or
  // * `invalidChars`: a String with a list of all invalid characters
  // * `repeat`: true if the character specification can repeat

  function StaticSegment(string) { this.string = string; }
  StaticSegment.prototype = {
    eachChar: function(callback) {
      var string = this.string, char;

      for (var i=0, l=string.length; i<l; i++) {
        char = string.charAt(i);
        callback({ validChars: char });
      }
    },

    regex: function() {
      return this.string.replace(escapeRegex, '\\$1');
    },

    generate: function() {
      return this.string;
    }
  };

  function DynamicSegment(name) { this.name = name; }
  DynamicSegment.prototype = {
    eachChar: function(callback) {
      callback({ invalidChars: "/", repeat: true });
    },

    regex: function() {
      return "([^/]+)";
    },

    generate: function(params) {
      return params[this.name];
    }
  };

  function StarSegment(name) { this.name = name; }
  StarSegment.prototype = {
    eachChar: function(callback) {
      callback({ invalidChars: "", repeat: true });
    },

    regex: function() {
      return "(.+)";
    },

    generate: function(params) {
      return params[this.name];
    }
  };

  function EpsilonSegment() {}
  EpsilonSegment.prototype = {
    eachChar: function() {},
    regex: function() { return ""; },
    generate: function() { return ""; }
  };

  function parse(route, names, types) {
    // normalize route as not starting with a "/". Recognition will
    // also normalize.
    if (route.charAt(0) === "/") { route = route.substr(1); }

    var segments = route.split("/"), results = [];

    for (var i=0, l=segments.length; i<l; i++) {
      var segment = segments[i], match;

      if (match = segment.match(/^:([^\/]+)$/)) {
        results.push(new DynamicSegment(match[1]));
        names.push(match[1]);
        types.dynamics++;
      } else if (match = segment.match(/^\*([^\/]+)$/)) {
        results.push(new StarSegment(match[1]));
        names.push(match[1]);
        types.stars++;
      } else if(segment === "") {
        results.push(new EpsilonSegment());
      } else {
        results.push(new StaticSegment(segment));
        types.statics++;
      }
    }

    return results;
  }

  // A State has a character specification and (`charSpec`) and a list of possible
  // subsequent states (`nextStates`).
  //
  // If a State is an accepting state, it will also have several additional
  // properties:
  //
  // * `regex`: A regular expression that is used to extract parameters from paths
  //   that reached this accepting state.
  // * `handlers`: Information on how to convert the list of captures into calls
  //   to registered handlers with the specified parameters
  // * `types`: How many static, dynamic or star segments in this route. Used to
  //   decide which route to use if multiple registered routes match a path.
  //
  // Currently, State is implemented naively by looping over `nextStates` and
  // comparing a character specification against a character. A more efficient
  // implementation would use a hash of keys pointing at one or more next states.

  function State(charSpec) {
    this.charSpec = charSpec;
    this.nextStates = [];
  }

  State.prototype = {
    get: function(charSpec) {
      var nextStates = this.nextStates;

      for (var i=0, l=nextStates.length; i<l; i++) {
        var child = nextStates[i];

        var isEqual = child.charSpec.validChars === charSpec.validChars;
        isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;

        if (isEqual) { return child; }
      }
    },

    put: function(charSpec) {
      var state;

      // If the character specification already exists in a child of the current
      // state, just return that state.
      if (state = this.get(charSpec)) { return state; }

      // Make a new state for the character spec
      state = new State(charSpec);

      // Insert the new state as a child of the current state
      this.nextStates.push(state);

      // If this character specification repeats, insert the new state as a child
      // of itself. Note that this will not trigger an infinite loop because each
      // transition during recognition consumes a character.
      if (charSpec.repeat) {
        state.nextStates.push(state);
      }

      // Return the new state
      return state;
    },

    // Find a list of child states matching the next character
    match: function(char) {
      // DEBUG "Processing `" + char + "`:"
      var nextStates = this.nextStates,
          child, charSpec, chars;

      // DEBUG "  " + debugState(this)
      var returned = [];

      for (var i=0, l=nextStates.length; i<l; i++) {
        child = nextStates[i];

        charSpec = child.charSpec;

        if (typeof (chars = charSpec.validChars) !== 'undefined') {
          if (chars.indexOf(char) !== -1) { returned.push(child); }
        } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
          if (chars.indexOf(char) === -1) { returned.push(child); }
        }
      }

      return returned;
    }

    /** IF DEBUG
    , debug: function() {
      var charSpec = this.charSpec,
          debug = "[",
          chars = charSpec.validChars || charSpec.invalidChars;

      if (charSpec.invalidChars) { debug += "^"; }
      debug += chars;
      debug += "]";

      if (charSpec.repeat) { debug += "+"; }

      return debug;
    }
    END IF **/
  };

  /** IF DEBUG
  function debug(log) {
    console.log(log);
  }

  function debugState(state) {
    return state.nextStates.map(function(n) {
      if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
      return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
    }).join(", ")
  }
  END IF **/

  // This is a somewhat naive strategy, but should work in a lot of cases
  // A better strategy would properly resolve /posts/:id/new and /posts/edit/:id
  function sortSolutions(states) {
    return states.sort(function(a, b) {
      if (a.types.stars !== b.types.stars) { return a.types.stars - b.types.stars; }
      if (a.types.dynamics !== b.types.dynamics) { return a.types.dynamics - b.types.dynamics; }
      if (a.types.statics !== b.types.statics) { return a.types.statics - b.types.statics; }

      return 0;
    });
  }

  function recognizeChar(states, char) {
    var nextStates = [];

    for (var i=0, l=states.length; i<l; i++) {
      var state = states[i];

      nextStates = nextStates.concat(state.match(char));
    }

    return nextStates;
  }

  function findHandler(state, path) {
    var handlers = state.handlers, regex = state.regex;
    var captures = path.match(regex), currentCapture = 1;
    var result = [];

    for (var i=0, l=handlers.length; i<l; i++) {
      var handler = handlers[i], names = handler.names, params = {};

      for (var j=0, m=names.length; j<m; j++) {
        params[names[j]] = captures[currentCapture++];
      }

      result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
    }

    return result;
  }

  function addSegment(currentState, segment) {
    segment.eachChar(function(char) {
      var state;

      currentState = currentState.put(char);
    });

    return currentState;
  }

  // The main interface

  var RouteRecognizer = function() {
    this.rootState = new State();
    this.names = {};
  };


  RouteRecognizer.prototype = {
    add: function(routes, options) {
      var currentState = this.rootState, regex = "^",
          types = { statics: 0, dynamics: 0, stars: 0 },
          handlers = [], allSegments = [], name;

      var isEmpty = true;

      for (var i=0, l=routes.length; i<l; i++) {
        var route = routes[i], names = [];

        var segments = parse(route.path, names, types);

        allSegments = allSegments.concat(segments);

        for (var j=0, m=segments.length; j<m; j++) {
          var segment = segments[j];

          if (segment instanceof EpsilonSegment) { continue; }

          isEmpty = false;

          // Add a "/" for the new segment
          currentState = currentState.put({ validChars: "/" });
          regex += "/";

          // Add a representation of the segment to the NFA and regex
          currentState = addSegment(currentState, segment);
          regex += segment.regex();
        }

        handlers.push({ handler: route.handler, names: names });
      }

      if (isEmpty) {
        currentState = currentState.put({ validChars: "/" });
        regex += "/";
      }

      currentState.handlers = handlers;
      currentState.regex = new RegExp(regex + "$");
      currentState.types = types;

      if (name = options && options.as) {
        this.names[name] = {
          segments: allSegments,
          handlers: handlers
        };
      }
    },

    handlersFor: function(name) {
      var route = this.names[name], result = [];
      if (!route) { throw new Error("There is no route named " + name); }

      for (var i=0, l=route.handlers.length; i<l; i++) {
        result.push(route.handlers[i]);
      }

      return result;
    },

    hasRoute: function(name) {
      return !!this.names[name];
    },

    generate: function(name, params) {
      var route = this.names[name], output = "";
      if (!route) { throw new Error("There is no route named " + name); }

      var segments = route.segments;

      for (var i=0, l=segments.length; i<l; i++) {
        var segment = segments[i];

        if (segment instanceof EpsilonSegment) { continue; }

        output += "/";
        output += segment.generate(params);
      }

      if (output.charAt(0) !== '/') { output = '/' + output; }

      return output;
    },

    recognize: function(path) {
      var states = [ this.rootState ],
          pathLen, i, l;

      // DEBUG GROUP path

      if (path.charAt(0) !== "/") { path = "/" + path; }

      pathLen = path.length;
      if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
        path = path.substr(0, pathLen - 1);
      }

      for (i=0, l=path.length; i<l; i++) {
        states = recognizeChar(states, path.charAt(i));
        if (!states.length) { break; }
      }

      // END DEBUG GROUP

      var solutions = [];
      for (i=0, l=states.length; i<l; i++) {
        if (states[i].handlers) { solutions.push(states[i]); }
      }

      states = sortSolutions(solutions);

      var state = solutions[0];

      if (state && state.handlers) {
        return findHandler(state, path);
      }
    }
  };

  function Target(path, matcher, delegate) {
    this.path = path;
    this.matcher = matcher;
    this.delegate = delegate;
  }

  Target.prototype = {
    to: function(target, callback) {
      var delegate = this.delegate;

      if (delegate && delegate.willAddRoute) {
        target = delegate.willAddRoute(this.matcher.target, target);
      }

      this.matcher.add(this.path, target);

      if (callback) {
        if (callback.length === 0) { throw new Error("You must have an argument in the function passed to `to`"); }
        this.matcher.addChild(this.path, target, callback, this.delegate);
      }
    }
  };

  function Matcher(target) {
    this.routes = {};
    this.children = {};
    this.target = target;
  }

  Matcher.prototype = {
    add: function(path, handler) {
      this.routes[path] = handler;
    },

    addChild: function(path, target, callback, delegate) {
      var matcher = new Matcher(target);
      this.children[path] = matcher;

      var match = generateMatch(path, matcher, delegate);

      if (delegate && delegate.contextEntered) {
        delegate.contextEntered(target, match);
      }

      callback(match);
    }
  };

  function generateMatch(startingPath, matcher, delegate) {
    return function(path, nestedCallback) {
      var fullPath = startingPath + path;

      if (nestedCallback) {
        nestedCallback(generateMatch(fullPath, matcher, delegate));
      } else {
        return new Target(startingPath + path, matcher, delegate);
      }
    };
  }

  function addRoute(routeArray, path, handler) {
    var len = 0;
    for (var i=0, l=routeArray.length; i<l; i++) {
      len += routeArray[i].path.length;
    }

    path = path.substr(len);
    routeArray.push({ path: path, handler: handler });
  }

  function eachRoute(baseRoute, matcher, callback, binding) {
    var routes = matcher.routes;

    for (var path in routes) {
      if (routes.hasOwnProperty(path)) {
        var routeArray = baseRoute.slice();
        addRoute(routeArray, path, routes[path]);

        if (matcher.children[path]) {
          eachRoute(routeArray, matcher.children[path], callback, binding);
        } else {
          callback.call(binding, routeArray);
        }
      }
    }
  }

  RouteRecognizer.prototype.map = function(callback, addRouteCallback) {
    var matcher = new Matcher();

    callback(generateMatch("", matcher, this.delegate));

    eachRoute([], matcher, function(route) {
      if (addRouteCallback) { addRouteCallback(this, route); }
      else { this.add(route); }
    }, this);
  };
  exports.RouteRecognizer = RouteRecognizer;
})(window);

(function(exports, RouteRecognizer, RSVP) {
  
  /**
    @private

    This file references several internal structures:

    ## `RecognizedHandler`

    * `{String} handler`: A handler name
    * `{Object} params`: A hash of recognized parameters

    ## `HandlerInfo`

    * `{Boolean} isDynamic`: whether a handler has any dynamic segments
    * `{String} name`: the name of a handler
    * `{Object} handler`: a handler object
    * `{Object} context`: the active context for the handler
  */


  var slice = Array.prototype.slice;



  /**
    @private

    A Transition is a thennable (a promise-like object) that represents
    an attempt to transition to another route. It can be aborted, either
    explicitly via `abort` or by attempting another transition while a
    previous one is still underway. An aborted transition can also
    be `retry()`d later.
   */

  function Transition(router, promise) {
    this.router = router;
    this.promise = promise;
    this.data = {};
    this.resolvedModels = {};
    this.providedModels = {};
    this.providedModelsArray = [];
    this.sequence = ++Transition.currentSequence;
    this.params = {};
  }

  Transition.currentSequence = 0;

  Transition.prototype = {
    targetName: null,
    urlMethod: 'update',
    providedModels: null,
    resolvedModels: null,
    params: null,

    /**
      The Transition's internal promise. Calling `.then` on this property
      is that same as calling `.then` on the Transition object itself, but
      this property is exposed for when you want to pass around a
      Transition's promise, but not the Transition object itself, since
      Transition object can be externally `abort`ed, while the promise
      cannot.
     */
    promise: null,

    /**
      Custom state can be stored on a Transition's `data` object.
      This can be useful for decorating a Transition within an earlier
      hook and shared with a later hook. Properties set on `data` will
      be copied to new transitions generated by calling `retry` on this
      transition.
     */
    data: null,

    /**
      A standard promise hook that resolves if the transition
      succeeds and rejects if it fails/redirects/aborts.

      Forwards to the internal `promise` property which you can
      use in situations where you want to pass around a thennable,
      but not the Transition itself.

      @param {Function} success
      @param {Function} failure
     */
    then: function(success, failure) {
      return this.promise.then(success, failure);
    },

    /**
      Aborts the Transition. Note you can also implicitly abort a transition
      by initiating another transition while a previous one is underway.
     */
    abort: function() {
      if (this.isAborted) { return this; }
      log(this.router, this.sequence, this.targetName + ": transition was aborted");
      this.isAborted = true;
      this.router.activeTransition = null;
      return this;
    },

    /**
      Retries a previously-aborted transition (making sure to abort the
      transition if it's still active). Returns a new transition that
      represents the new attempt to transition.
     */
    retry: function() {
      this.abort();

      var recogHandlers = this.router.recognizer.handlersFor(this.targetName),
          newTransition = performTransition(this.router, recogHandlers, this.providedModelsArray, this.params, this.data);

      return newTransition;
    },

    /**
      Sets the URL-changing method to be employed at the end of a
      successful transition. By default, a new Transition will just
      use `updateURL`, but passing 'replace' to this method will
      cause the URL to update using 'replaceWith' instead. Omitting
      a parameter will disable the URL change, allowing for transitions
      that don't update the URL at completion (this is also used for
      handleURL, since the URL has already changed before the
      transition took place).

      @param {String} method the type of URL-changing method to use
        at the end of a transition. Accepted values are 'replace',
        falsy values, or any other non-falsy value (which is
        interpreted as an updateURL transition).

      @return {Transition} this transition
     */
    method: function(method) {
      this.urlMethod = method;
      return this;
    }
  };

  function Router() {
    this.recognizer = new RouteRecognizer();
  }



  /**
    Promise reject reasons passed to promise rejection
    handlers for failed transitions.
   */
  Router.UnrecognizedURLError = function(message) {
    this.message = (message || "UnrecognizedURLError");
    this.name = "UnrecognizedURLError";
  };

  Router.TransitionAborted = function(message) {
    this.message = (message || "TransitionAborted");
    this.name = "TransitionAborted";
  };

  function errorTransition(router, reason) {
    return new Transition(router, RSVP.reject(reason));
  }


  Router.prototype = {
    /**
      The main entry point into the router. The API is essentially
      the same as the `map` method in `route-recognizer`.

      This method extracts the String handler at the last `.to()`
      call and uses it as the name of the whole route.

      @param {Function} callback
    */
    map: function(callback) {
      this.recognizer.delegate = this.delegate;

      this.recognizer.map(callback, function(recognizer, route) {
        var lastHandler = route[route.length - 1].handler;
        var args = [route, { as: lastHandler }];
        recognizer.add.apply(recognizer, args);
      });
    },

    hasRoute: function(route) {
      return this.recognizer.hasRoute(route);
    },

    /**
      Clears the current and target route handlers and triggers exit
      on each of them starting at the leaf and traversing up through
      its ancestors.
    */
    reset: function() {
      eachHandler(this.currentHandlerInfos || [], function(handlerInfo) {
        var handler = handlerInfo.handler;
        if (handler.exit) {
          handler.exit();
        }
      });
      this.currentHandlerInfos = null;
      this.targetHandlerInfos = null;
    },

    activeTransition: null,

    /**
      var handler = handlerInfo.handler;
      The entry point for handling a change to the URL (usually
      via the back and forward button).

      Returns an Array of handlers and the parameters associated
      with those parameters.

      @param {String} url a URL to process

      @return {Array} an Array of `[handler, parameter]` tuples
    */
    handleURL: function(url) {
      // Perform a URL-based transition, but don't change
      // the URL afterward, since it already happened.
      var args = slice.call(arguments);
      if (url.charAt(0) !== '/') { args[0] = '/' + url; }
      return doTransition(this, args).method(null);
    },

    /**
      Hook point for updating the URL.

      @param {String} url a URL to update to
    */
    updateURL: function() {
      throw new Error("updateURL is not implemented");
    },

    /**
      Hook point for replacing the current URL, i.e. with replaceState

      By default this behaves the same as `updateURL`

      @param {String} url a URL to update to
    */
    replaceURL: function(url) {
      this.updateURL(url);
    },

    /**
      Transition into the specified named route.

      If necessary, trigger the exit callback on any handlers
      that are no longer represented by the target route.

      @param {String} name the name of the route
    */
    transitionTo: function(name) {
      return doTransition(this, arguments);
    },

    /**
      Identical to `transitionTo` except that the current URL will be replaced
      if possible.

      This method is intended primarily for use with `replaceState`.

      @param {String} name the name of the route
    */
    replaceWith: function(name) {
      return doTransition(this, arguments).method('replace');
    },

    /**
      @private

      This method takes a handler name and a list of contexts and returns
      a serialized parameter hash suitable to pass to `recognizer.generate()`.

      @param {String} handlerName
      @param {Array[Object]} contexts
      @return {Object} a serialized parameter hash
    */
    paramsForHandler: function(handlerName, contexts) {
      return paramsForHandler(this, handlerName, slice.call(arguments, 1));
    },

    /**
      Take a named route and context objects and generate a
      URL.

      @param {String} name the name of the route to generate
        a URL for
      @param {...Object} objects a list of objects to serialize

      @return {String} a URL
    */
    generate: function(handlerName) {
      var params = paramsForHandler(this, handlerName, slice.call(arguments, 1));
      return this.recognizer.generate(handlerName, params);
    },

    isActive: function(handlerName) {
      var contexts = slice.call(arguments, 1);

      var targetHandlerInfos = this.targetHandlerInfos,
          found = false, names, object, handlerInfo, handlerObj;

      if (!targetHandlerInfos) { return false; }

      var recogHandlers = this.recognizer.handlersFor(targetHandlerInfos[targetHandlerInfos.length - 1].name);

      for (var i=targetHandlerInfos.length-1; i>=0; i--) {
        handlerInfo = targetHandlerInfos[i];
        if (handlerInfo.name === handlerName) { found = true; }

        if (found) {
          if (contexts.length === 0) { break; }

          if (handlerInfo.isDynamic) {
            object = contexts.pop();

            if (isParam(object)) {
              var recogHandler = recogHandlers[i], name = recogHandler.names[0];
              if (object.toString() !== this.currentParams[name]) { return false; }
            } else if (handlerInfo.context !== object) {
              return false;
            }
          }
        }
      }

      return contexts.length === 0 && found;
    },

    trigger: function(name) {
      var args = slice.call(arguments);
      trigger(this.currentHandlerInfos, false, args);
    },

    /**
      Hook point for logging transition status updates.

      @param {String} message The message to log.
    */
    log: null
  };

  /**
    @private

    Used internally for both URL and named transition to determine
    a shared pivot parent route and other data necessary to perform
    a transition.
   */
  function getMatchPoint(router, handlers, objects, inputParams) {

    var matchPoint = handlers.length,
        providedModels = {}, i,
        currentHandlerInfos = router.currentHandlerInfos || [],
        params = {},
        oldParams = router.currentParams || {},
        activeTransition = router.activeTransition,
        handlerParams = {},
        obj;

    objects = slice.call(objects);
    merge(params, inputParams);

    for (i = handlers.length - 1; i >= 0; i--) {
      var handlerObj = handlers[i],
          handlerName = handlerObj.handler,
          oldHandlerInfo = currentHandlerInfos[i],
          hasChanged = false;

      // Check if handler names have changed.
      if (!oldHandlerInfo || oldHandlerInfo.name !== handlerObj.handler) { hasChanged = true; }

      if (handlerObj.isDynamic) {
        // URL transition.

        if (obj = getMatchPointObject(objects, handlerName, activeTransition, true, params)) {
          hasChanged = true;
          providedModels[handlerName] = obj;
        } else {
          handlerParams[handlerName] = {};
          for (var prop in handlerObj.params) {
            if (!handlerObj.params.hasOwnProperty(prop)) { continue; }
            var newParam = handlerObj.params[prop];
            if (oldParams[prop] !== newParam) { hasChanged = true; }
            handlerParams[handlerName][prop] = params[prop] = newParam;
          }
        }
      } else if (handlerObj.hasOwnProperty('names')) {
        // Named transition.

        if (objects.length) { hasChanged = true; }

        if (obj = getMatchPointObject(objects, handlerName, activeTransition, handlerObj.names[0], params)) {
          providedModels[handlerName] = obj;
        } else {
          var names = handlerObj.names;
          handlerParams[handlerName] = {};
          for (var j = 0, len = names.length; j < len; ++j) {
            var name = names[j];
            handlerParams[handlerName][name] = params[name] = params[name] || oldParams[name];
          }
        }
      }

      if (hasChanged) { matchPoint = i; }
    }

    if (objects.length > 0) {
      throw new Error("More context objects were passed than there are dynamic segments for the route: " + handlers[handlers.length - 1].handler);
    }

    return { matchPoint: matchPoint, providedModels: providedModels, params: params, handlerParams: handlerParams };
  }

  function getMatchPointObject(objects, handlerName, activeTransition, paramName, params) {

    if (objects.length && paramName) {

      var object = objects.pop();

      // If provided object is string or number, treat as param.
      if (isParam(object)) {
        params[paramName] = object.toString();
      } else {
        return object;
      }
    } else if (activeTransition) {
      // Use model from previous transition attempt, preferably the resolved one.
      return activeTransition.resolvedModels[handlerName] ||
             (paramName && activeTransition.providedModels[handlerName]);
    }
  }

  function isParam(object) {
    return (typeof object === "string" || object instanceof String || !isNaN(object));
  }

  /**
    @private

    This method takes a handler name and a list of contexts and returns
    a serialized parameter hash suitable to pass to `recognizer.generate()`.

    @param {Router} router
    @param {String} handlerName
    @param {Array[Object]} objects
    @return {Object} a serialized parameter hash
  */
  function paramsForHandler(router, handlerName, objects) {

    var handlers = router.recognizer.handlersFor(handlerName),
        params = {},
        matchPoint = getMatchPoint(router, handlers, objects).matchPoint,
        object, handlerObj, handler, names, i;

    for (i=0; i<handlers.length; i++) {
      handlerObj = handlers[i];
      handler = router.getHandler(handlerObj.handler);
      names = handlerObj.names;

      // If it's a dynamic segment
      if (names.length) {
        // If we have objects, use them
        if (i >= matchPoint) {
          object = objects.shift();
        // Otherwise use existing context
        } else {
          object = handler.context;
        }

        // Serialize to generate params
        merge(params, serialize(handler, object, names));
      }
    }
    return params;
  }

  function merge(hash, other) {
    for (var prop in other) {
      if (other.hasOwnProperty(prop)) { hash[prop] = other[prop]; }
    }
  }

  /**
    @private
  */
  function createNamedTransition(router, args) {
    var handlers = router.recognizer.handlersFor(args[0]);

    log(router, "Attempting transition to " + args[0]);

    return performTransition(router, handlers, slice.call(args, 1), router.currentParams);
  }

  /**
    @private
  */
  function createURLTransition(router, url) {

    var results = router.recognizer.recognize(url),
        currentHandlerInfos = router.currentHandlerInfos;

    log(router, "Attempting URL transition to " + url);

    if (!results) {
      return errorTransition(router, new Router.UnrecognizedURLError(url));
    }

    return performTransition(router, results, [], {});
  }


  /**
    @private

    Takes an Array of `HandlerInfo`s, figures out which ones are
    exiting, entering, or changing contexts, and calls the
    proper handler hooks.

    For example, consider the following tree of handlers. Each handler is
    followed by the URL segment it handles.

    ```
    |~index ("/")
    | |~posts ("/posts")
    | | |-showPost ("/:id")
    | | |-newPost ("/new")
    | | |-editPost ("/edit")
    | |~about ("/about/:id")
    ```

    Consider the following transitions:

    1. A URL transition to `/posts/1`.
       1. Triggers the `*model` callbacks on the
          `index`, `posts`, and `showPost` handlers
       2. Triggers the `enter` callback on the same
       3. Triggers the `setup` callback on the same
    2. A direct transition to `newPost`
       1. Triggers the `exit` callback on `showPost`
       2. Triggers the `enter` callback on `newPost`
       3. Triggers the `setup` callback on `newPost`
    3. A direct transition to `about` with a specified
       context object
       1. Triggers the `exit` callback on `newPost`
          and `posts`
       2. Triggers the `serialize` callback on `about`
       3. Triggers the `enter` callback on `about`
       4. Triggers the `setup` callback on `about`

    @param {Transition} transition
    @param {Array[HandlerInfo]} handlerInfos
  */
  function setupContexts(transition, handlerInfos) {
    var router = transition.router,
        partition = partitionHandlers(router.currentHandlerInfos || [], handlerInfos);

    router.targetHandlerInfos = handlerInfos;

    eachHandler(partition.exited, function(handlerInfo) {
      var handler = handlerInfo.handler;
      delete handler.context;
      if (handler.exit) { handler.exit(); }
    });

    var currentHandlerInfos = partition.unchanged.slice();
    router.currentHandlerInfos = currentHandlerInfos;

    eachHandler(partition.updatedContext, function(handlerInfo) {
      handlerEnteredOrUpdated(transition, currentHandlerInfos, handlerInfo, false);
    });

    eachHandler(partition.entered, function(handlerInfo) {
      handlerEnteredOrUpdated(transition, currentHandlerInfos, handlerInfo, true);
    });
  }

  /**
    @private

    Helper method used by setupContexts. Handles errors or redirects
    that may happen in enter/setup.
  */
  function handlerEnteredOrUpdated(transition, currentHandlerInfos, handlerInfo, enter) {
    var handler = handlerInfo.handler,
        context = handlerInfo.context;

    try {
      if (enter && handler.enter) { handler.enter(); }
      checkAbort(transition);

      setContext(handler, context);

      if (handler.setup) { handler.setup(context); }
      checkAbort(transition);
    } catch(e) {
      if (!(e instanceof Router.TransitionAborted)) {
        // Trigger the `error` event starting from this failed handler.
        trigger(currentHandlerInfos.concat(handlerInfo), true, ['error', e, transition]);
      }

      // Propagate the error so that the transition promise will reject.
      throw e;
    }

    currentHandlerInfos.push(handlerInfo);
  }


  /**
    @private

    Iterates over an array of `HandlerInfo`s, passing the handler
    and context into the callback.

    @param {Array[HandlerInfo]} handlerInfos
    @param {Function(Object, Object)} callback
  */
  function eachHandler(handlerInfos, callback) {
    for (var i=0, l=handlerInfos.length; i<l; i++) {
      callback(handlerInfos[i]);
    }
  }

  /**
    @private

    This function is called when transitioning from one URL to
    another to determine which handlers are not longer active,
    which handlers are newly active, and which handlers remain
    active but have their context changed.

    Take a list of old handlers and new handlers and partition
    them into four buckets:

    * unchanged: the handler was active in both the old and
      new URL, and its context remains the same
    * updated context: the handler was active in both the
      old and new URL, but its context changed. The handler's
      `setup` method, if any, will be called with the new
      context.
    * exited: the handler was active in the old URL, but is
      no longer active.
    * entered: the handler was not active in the old URL, but
      is now active.

    The PartitionedHandlers structure has four fields:

    * `updatedContext`: a list of `HandlerInfo` objects that
      represent handlers that remain active but have a changed
      context
    * `entered`: a list of `HandlerInfo` objects that represent
      handlers that are newly active
    * `exited`: a list of `HandlerInfo` objects that are no
      longer active.
    * `unchanged`: a list of `HanderInfo` objects that remain active.

    @param {Array[HandlerInfo]} oldHandlers a list of the handler
      information for the previous URL (or `[]` if this is the
      first handled transition)
    @param {Array[HandlerInfo]} newHandlers a list of the handler
      information for the new URL

    @return {Partition}
  */
  function partitionHandlers(oldHandlers, newHandlers) {
    var handlers = {
          updatedContext: [],
          exited: [],
          entered: [],
          unchanged: []
        };

    var handlerChanged, contextChanged, i, l;

    for (i=0, l=newHandlers.length; i<l; i++) {
      var oldHandler = oldHandlers[i], newHandler = newHandlers[i];

      if (!oldHandler || oldHandler.handler !== newHandler.handler) {
        handlerChanged = true;
      }

      if (handlerChanged) {
        handlers.entered.push(newHandler);
        if (oldHandler) { handlers.exited.unshift(oldHandler); }
      } else if (contextChanged || oldHandler.context !== newHandler.context) {
        contextChanged = true;
        handlers.updatedContext.push(newHandler);
      } else {
        handlers.unchanged.push(oldHandler);
      }
    }

    for (i=newHandlers.length, l=oldHandlers.length; i<l; i++) {
      handlers.exited.unshift(oldHandlers[i]);
    }

    return handlers;
  }

  function trigger(handlerInfos, ignoreFailure, args) {

    var name = args.shift();

    if (!handlerInfos) {
      if (ignoreFailure) { return; }
      throw new Error("Could not trigger event '" + name + "'. There are no active handlers");
    }

    var eventWasHandled = false;

    for (var i=handlerInfos.length-1; i>=0; i--) {
      var handlerInfo = handlerInfos[i],
          handler = handlerInfo.handler;

      if (handler.events && handler.events[name]) {
        if (handler.events[name].apply(handler, args) === true) {
          eventWasHandled = true;
        } else {
          return;
        }
      }
    }

    if (!eventWasHandled && !ignoreFailure) {
      throw new Error("Nothing handled the event '" + name + "'.");
    }
  }

  function setContext(handler, context) {
    handler.context = context;
    if (handler.contextDidChange) { handler.contextDidChange(); }
  }

  /**
    @private

    Creates, begins, and returns a Transition.
   */
  function performTransition(router, recogHandlers, providedModelsArray, params, data) {

    var matchPointResults = getMatchPoint(router, recogHandlers, providedModelsArray, params),
        targetName = recogHandlers[recogHandlers.length - 1].handler,
        wasTransitioning = false,
        currentHandlerInfos = router.currentHandlerInfos;

    // Check if there's already a transition underway.
    if (router.activeTransition) {
      if (transitionsIdentical(router.activeTransition, targetName, providedModelsArray)) {
        return router.activeTransition;
      }
      router.activeTransition.abort();
      wasTransitioning = true;
    }

    var deferred = RSVP.defer(),
        transition = new Transition(router, deferred.promise);

    transition.targetName = targetName;
    transition.providedModels = matchPointResults.providedModels;
    transition.providedModelsArray = providedModelsArray;
    transition.params = matchPointResults.params;
    transition.data = data || {};
    router.activeTransition = transition;

    var handlerInfos = generateHandlerInfos(router, recogHandlers);

    // Fire 'willTransition' event on current handlers, but don't fire it
    // if a transition was already underway.
    if (!wasTransitioning) {
      trigger(currentHandlerInfos, true, ['willTransition', transition]);
    }

    log(router, transition.sequence, "Beginning validation for transition to " + transition.targetName);
    validateEntry(transition, handlerInfos, 0, matchPointResults.matchPoint, matchPointResults.handlerParams)
                 .then(transitionSuccess, transitionFailure);

    return transition;

    function transitionSuccess() {
      checkAbort(transition);

      try {
        log(router, transition.sequence, "Validation succeeded, finalizing transition;");

        // Don't overwrite contexts / update URL if this was a noop transition.
        if (!currentHandlerInfos || !currentHandlerInfos.length ||
            currentHandlerInfos.length !== matchPointResults.matchPoint) {
          finalizeTransition(transition, handlerInfos);
        }

        if (router.didTransition) {
          router.didTransition(handlerInfos);
        }

        log(router, transition.sequence, "TRANSITION COMPLETE.");

        // Resolve with the final handler.
        deferred.resolve(handlerInfos[handlerInfos.length - 1].handler);
      } catch(e) {
        deferred.reject(e);
      }

      // Don't nullify if another transition is underway (meaning
      // there was a transition initiated with enter/setup).
      if (!transition.isAborted) {
        router.activeTransition = null;
      }
    }

    function transitionFailure(reason) {
      deferred.reject(reason);
    }
  }

  /**
    @private

    Accepts handlers in Recognizer format, either returned from
    recognize() or handlersFor(), and returns unified
    `HandlerInfo`s.
   */
  function generateHandlerInfos(router, recogHandlers) {
    var handlerInfos = [];
    for (var i = 0, len = recogHandlers.length; i < len; ++i) {
      var handlerObj = recogHandlers[i],
          isDynamic = handlerObj.isDynamic || (handlerObj.names && handlerObj.names.length);

      handlerInfos.push({
        isDynamic: !!isDynamic,
        name: handlerObj.handler,
        handler: router.getHandler(handlerObj.handler)
      });
    }
    return handlerInfos;
  }

  /**
    @private
   */
  function transitionsIdentical(oldTransition, targetName, providedModelsArray) {

    if (oldTransition.targetName !== targetName) { return false; }

    var oldModels = oldTransition.providedModelsArray;
    if (oldModels.length !== providedModelsArray.length) { return false; }

    for (var i = 0, len = oldModels.length; i < len; ++i) {
      if (oldModels[i] !== providedModelsArray[i]) { return false; }
    }
    return true;
  }

  /**
    @private

    Updates the URL (if necessary) and calls `setupContexts`
    to update the router's array of `currentHandlerInfos`.
   */
  function finalizeTransition(transition, handlerInfos) {

    var router = transition.router,
        seq = transition.sequence,
        handlerName = handlerInfos[handlerInfos.length - 1].name;

    // Collect params for URL.
    var objects = [], providedModels = transition.providedModelsArray.slice();
    for (var i = handlerInfos.length - 1; i>=0; --i) {
      var handlerInfo = handlerInfos[i];
      if (handlerInfo.isDynamic) {
        var providedModel = providedModels.pop();
        objects.unshift(isParam(providedModel) ? providedModel.toString() : handlerInfo.context);
      }
    }

    var params = paramsForHandler(router, handlerName, objects);

    transition.providedModelsArray = [];
    transition.providedContexts = {};
    router.currentParams = params;

    var urlMethod = transition.urlMethod;
    if (urlMethod) {
      var url = router.recognizer.generate(handlerName, params);

      if (urlMethod === 'replace') {
        router.replaceURL(url);
      } else {
        // Assume everything else is just a URL update for now.
        router.updateURL(url);
      }
    }

    setupContexts(transition, handlerInfos);
  }

  /**
    @private

    Internal function used to construct the chain of promises used
    to validate a transition. Wraps calls to `beforeModel`, `model`,
    and `afterModel` in promises, and checks for redirects/aborts
    between each.
   */
  function validateEntry(transition, handlerInfos, index, matchPoint, handlerParams) {

    if (index === handlerInfos.length) {
      // No more contexts to resolve.
      return RSVP.resolve(transition.resolvedModels);
    }

    var router = transition.router,
        handlerInfo = handlerInfos[index],
        handler = handlerInfo.handler,
        handlerName = handlerInfo.name,
        seq = transition.sequence;

    if (index < matchPoint) {
      log(router, seq, handlerName + ": using context from already-active handler");

      // We're before the match point, so don't run any hooks,
      // just use the already resolved context from the handler.
      transition.resolvedModels[handlerInfo.name] =
        transition.providedModels[handlerInfo.name] ||
        handlerInfo.handler.context;
      return proceed();
    }

    return RSVP.resolve().then(handleAbort)
                         .then(beforeModel)
                         .then(handleAbort)
                         .then(model)
                         .then(handleAbort)
                         .then(afterModel)
                         .then(handleAbort)
                         .then(proceed)
                         .then(null, handleError);

    function handleAbort(result) {
      if (transition.isAborted) {
        log(transition.router, transition.sequence, "detected abort.");
        return RSVP.reject(new Router.TransitionAborted());
      }

      return result;
    }

    function handleError(reason) {
      if (reason instanceof Router.TransitionAborted) {
        // if the transition was aborted and *no additional* error was thrown,
        // reject with the Router.TransitionAborted instance
        return RSVP.reject(reason);
      }

      // otherwise, we're here because of a different error
      transition.abort();

      log(router, seq, handlerName + ": handling error: " + reason);

      // An error was thrown / promise rejected, so fire an
      // `error` event from this handler info up to root.
      trigger(handlerInfos.slice(0, index + 1), true, ['error', reason, transition]);

      if (handler.error) {
        handler.error(reason, transition);
      }

      // Propagate the original error.
      return RSVP.reject(reason);
    }

    function beforeModel() {

      log(router, seq, handlerName + ": calling beforeModel hook");

      var p = handler.beforeModel && handler.beforeModel(transition);
      return (p instanceof Transition) ? null : p;
    }

    function model() {
      log(router, seq, handlerName + ": resolving model");

      var p = getModel(handlerInfo, transition, handlerParams[handlerName], index >= matchPoint);
      return (p instanceof Transition) ? null : p;
    }

    function afterModel(context) {

      log(router, seq, handlerName + ": calling afterModel hook");

      // Pass the context and resolved parent contexts to afterModel, but we don't
      // want to use the value returned from `afterModel` in any way, but rather
      // always resolve with the original `context` object.

      transition.resolvedModels[handlerInfo.name] = context;

      var p = handler.afterModel && handler.afterModel(context, transition);
      return (p instanceof Transition) ? null : p;
    }

    function proceed() {
      log(router, seq, handlerName + ": validation succeeded, proceeding");

      handlerInfo.context = transition.resolvedModels[handlerInfo.name];
      return validateEntry(transition, handlerInfos, index + 1, matchPoint, handlerParams);
    }
  }

  /**
    @private

    Throws a TransitionAborted if the provided transition has been aborted.
   */
  function checkAbort(transition) {
    if (transition.isAborted) {
      log(transition.router, transition.sequence, "detected abort.");
      throw new Router.TransitionAborted();
    }
  }

  /**
    @private

    Encapsulates the logic for whether to call `model` on a route,
    or use one of the models provided to `transitionTo`.
   */
  function getModel(handlerInfo, transition, handlerParams, needsUpdate) {

    var handler = handlerInfo.handler,
        handlerName = handlerInfo.name;

    if (!needsUpdate && handler.hasOwnProperty('context')) {
      return handler.context;
    }

    if (transition.providedModels.hasOwnProperty(handlerName)) {
      var providedModel = transition.providedModels[handlerName];
      return typeof providedModel === 'function' ? providedModel() : providedModel;
    }

    return handler.model && handler.model(handlerParams || {}, transition);
  }

  /**
    @private
   */
  function log(router, sequence, msg) {

    if (!router.log) { return; }

    if (arguments.length === 3) {
      router.log("Transition #" + sequence + ": " + msg);
    } else {
      msg = sequence;
      router.log(msg);
    }
  }

  /**
    @private

    Begins and returns a Transition based on the provided
    arguments. Accepts arguments in the form of both URL
    transitions and named transitions.

    @param {Router} router
    @param {Array[Object]} args arguments passed to transitionTo,
      replaceWith, or handleURL
  */
  function doTransition(router, args) {
    // Normalize blank transitions to root URL transitions.
    var name = args[0] || '/';

    if (name.charAt(0) === '/') {
      return createURLTransition(router, name);
    } else {
      return createNamedTransition(router, args);
    }
  }

  /**
    @private

    Serializes a handler using its custom `serialize` method or
    by a default that looks up the expected property name from
    the dynamic segment.

    @param {Object} handler a router handler
    @param {Object} model the model to be serialized for this handler
    @param {Array[Object]} names the names array attached to an
      handler object returned from router.recognizer.handlersFor()
  */
  function serialize(handler, model, names) {

    var object = {};
    if (isParam(model)) {
      object[names[0]] = model;
      return object;
    }

    // Use custom serialize if it exists.
    if (handler.serialize) {
      return handler.serialize(model, names);
    }

    if (names.length !== 1) { return; }

    var name = names[0];

    if (/_id$/.test(name)) {
      object[name] = model.id;
    } else {
      object[name] = model;
    }
    return object;
  }


  exports.Router = Router;
})(window, window.RouteRecognizer, window.RSVP);

(function (global, doc) {
  

  var App = (function (undefined) {

    // static
    var default_binding, default_mixin, default_elem;


    // context
    default_binding = function (self, mixin) {
      var key,
          out = {};

      if ('function' === typeof mixin) {
        return function () {
          return mixin.apply(self, arguments);
        };
      }

      for (key in mixin) {
        out[key] = default_binding(self, mixin[key]);
      }

      return out;
    };


    // models
    default_mixin = function (params) { return params; };


    // DOM
    default_elem = function (tag) {
      return doc.createElement && doc.createElement(tag);
    };


    // instance
    return function (path) {
      // private
      var exception, instance, matcher, loader, router,
          default_path = path || doc.location.pathname,
          default_link,
          link_params,
          url_params,
          redirect,
          popstate;


      // router.js
      router = new Router();


      // links
      link_params = function (path, params, update) {
        if ('boolean' === typeof params) {
          update = params;
          params = undefined;
        }

        if (String(path).charAt(0) !== '/') {
          path = instance.context.url(path, params || {});
        }

        update = params && params.update || update;
        update = null == update ? true : update;

        return [path, params || {}, update];
      };

      redirect = function (to) {
        return function (e) {
          if (e && e.preventDefault) {
            e.preventDefault();
          }

          instance.context.go(to);

          return false;
        };
      };

      popstate = function (e) {
        instance.context.go(e.state && e.state.to ? e.state.to : default_path, false);
      };


      // UJS
      default_link = function (path, params) {
        var a = default_elem('a'),
            attribute,
            href;

        url_params = link_params(path, params);
        href = url_params.shift();
        params = url_params.shift();
        a.innerHTML = path;
        a.href = href;

        // FIX: IE/PhantomJS (?)
        if (! a.click || 'function' !== typeof a.click) {
          a.click = redirect(href);
        } else if (a.addEventListener) {
          a.addEventListener('click', redirect(href), false);
        } else if (a.attachEvent) {
          a.attachEvent('onclick', redirect(href));
        } else {
          a.onclick = redirect(href);
        }

        for (attribute in params) {
          a[attribute] = params[attribute];
        }

        return a;
      };


      // binding
      matcher = function (routes) {
        var key,
            self,
            handler,
            handlers = {};

        self = this;

        router.map(function(match) {
          handlers = routes.apply(self, [match]) || {};
        });

        for (key in handlers) {
          handler = handlers[key];
          this[key] = typeof handler === 'function' ? { setup: handler } : handler;

          if (! ('model' in this[key])) {
            this[key].model = default_mixin;
          }

          router.handlers[key] = default_binding(instance.context, this[key]);
        }
      };


      // methods
      loader = function (modules) {
        var module,
            klass,
            out = {};

        for (module in modules) {
          if (! isNaN(-module)) {
            klass = String(modules[module]);
            klass = /function\s(.+?)\b/.exec(klass)[1] || null;
          } else {
            klass = module;
          }

          if ('function' !== typeof modules[module]) {
            throw new Error('<' + (klass || modules[module]) + '> is not a module!');
          }

          module = new modules[module](instance);

          if (! module.initialize_module || 'function' !== typeof module.initialize_module) {
            throw new Error('<' + klass + '#initialize_module> is missing!');
          }

          instance.context.send(module.initialize_module, { draw: default_binding(module, matcher) });

          out[klass] = module;
        }

        return out;
      };


      // public
      instance = {
        router: router,
        modules: {},
        context: {
          // locals
          globals: {},
          helpers: {},

          // API
          fire: function (event) { router.trigger(event); },

          send: function (partial, params) {
            var length,
                retval,
                index = 0;

            partial = 'object' === typeof partial && partial.length ? partial : [partial];
            params = 'object' === typeof params && params.length === undefined ? params : {};

            length = partial.length;

            for (; index < length; index += 1) {
              retval = partial[index].apply(instance.context, [params]);
            }

            return retval;
          },

          link: function (path, params, update) { return default_link(path, params, update); },

          url: function (name, params) {
            try {
              return router.recognizer.generate(name, params);
            } catch (exception) {
              throw new Error('<' + name + '> route not found or missing params!');
            }
          },

          go: function (path, params, update) {
            url_params = link_params(path, params, update);

            return router.redirectURL(url_params.shift(), url_params.pop(), url_params);
          }
        },

        run: function () {
          if (! this.modules || 0 === this.modules.length) {
            throw new Error('<App#load> cannot run without modules!');
          }

          return this.context.go(default_path, false);
        },

        load: function (modules) {
          var index,
              module;

          if ('object' !== typeof modules) {
            modules = modules && [modules];
          }

          if (! modules || 0 === modules.length) {
            throw new Error('<App#load> require some modules!');
          }

          modules = loader(modules);

          for (index in modules) {
            if (! this.modules[index] && 'object' === typeof modules[index]) {
              module = modules[index];
              this.modules[index] = module;
            }
          }

          return this;
        }
      };


      // construct
      router.handlers = {};

      router.updateURL = function(path) {
        if (global.history && global.history.pushState) {
          global.history.pushState({ to: path }, null, path);
        }
      };

      router.getHandler = function(name) {
        return router.handlers[name] || {};
      };

      router.redirectURL = function(path, update, params) {
        if (false !== update) {
          router.updateURL(path);
          return router.handleURL(path);
        } else {
          return router.transitionTo(path, params);
        }
      };


      if (global.addEventListener) {
        global.addEventListener('popstate', popstate);
      } else if (global.attachEvent) {
        global.attachEvent('popstate', popstate);
      } else {
        global.onpopstate = popstate;
      }

      return instance;
    };
  })();


  // helpers (?)
  App.modules = function () {
    var module,
        list = {};

    for (module in App) {
      if (module.charAt(0) === module.charAt(0).toUpperCase()) {
        list[module] = App[module];
      }
    }

    return list;
  };


  // export
  if ('undefined' !== typeof module && module.exports) {
    module.exports = App;
  } else if ('function' === typeof define && define.amd) {
    define(function () { return App; });
  } else {
    global.App = App;
  }

})(window, document);
