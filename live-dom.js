
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.$live = factory();
  }
}(this, function () {

  var on = Element.prototype.addEventListener ? function (el, eventName, listener, useCapture) {
    return el.addEventListener(eventName, listener, useCapture);
  } : function (el, eventName, listener, useCapture) {
    return el.attachEvent( 'on' + eventName, listener, useCapture );
  };

  var off = Element.prototype.removeEventListener ? function (el, eventName, listener, useCapture) {
    return el.removeEventListener(eventName, listener, useCapture);
  } : function (el, eventName, listener, useCapture) {
    return el.detachEvent( 'on' + eventName, listener, useCapture );
  };

  var triggerEvent = document.createEvent ? function (element, eventName, data) {
    var event = document.createEvent('HTMLEvents');
    event.data = data;
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
    return event;
  } : function (element, eventName, data) {
    var event = document.createEventObject();
    event.data = data;
    element.fireEvent('on' + eventName, event);
    return event;
  };

  var each = [].forEach,
      noop = function (v) { return v; },
      readyListeners = [],
      runCB = function (cb) { cb(); },
      initReady = function () {
        if( !readyListeners ) return;
        var listeners = readyListeners;
        readyListeners = null;
        listeners.forEach(runCB);
        off(document, 'DOMContentLoaded', initReady);
        off(window, 'load', initReady);
      };

  on(document, 'DOMContentLoaded', initReady);
  on(window, 'load', initReady);

  function ready (callback) {
    if( callback instanceof Function ) {
      if( readyListeners ) {
        readyListeners.push(callback);
      } else {
        callback();
      }
    }
  }

  // $live implementation

  var handlers = {},
      pluginsFilterCache = {};

  function filter (list, iteratee) {
    var result = [], n = 0;

    for( var i = 0, len = list.length; i < len ; i++ ) {
      if( iteratee(list[i]) ) {
        result[n++] = list[i];
      }
    }

    return result;
  }

  function pluginSelectorFilter (pluginSelector) {
    if( !pluginsFilterCache[pluginSelector] ) {
      pluginsFilterCache[pluginSelector] = function (el) {
        el.$$plugins = el.$$plugins || {};
        if( !el.$$plugins[pluginSelector] ) {
          el.$$plugins[pluginSelector] = true;
          return true;
        }
      };
    }
    return pluginsFilterCache[pluginSelector];
  }

  function runSelector (pluginSelector, parent) {
    var handler = handlers[pluginSelector],
        elements = filter( (parent || document).querySelectorAll(pluginSelector), pluginSelectorFilter(pluginSelector) );

    if( handler && elements.length ) {
      if( handler._collection ) {
        handler( elements );
      } else {
        each.call(elements, function (el){
          handler.call(el, el);
        });
      }
    }
  }

  var liveRunning = null,
      useParent = true,
      initLive = function (cb) {
        ready(function () {
          // console.debug('$live:ready', typeof cb );

          for( var pluginSelector in handlers ) {
            runSelector(pluginSelector);
          }

          if( window.MutationObserver ) {
            new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                var target = useParent ? mutation.target : document;
                // console.log(mutation.target);
                for( var pluginSelector in handlers ) {
                  runSelector(pluginSelector, target);
                }

                [].forEach.call(mutation.removedNodes, function (node) {
                  triggerEvent(node, 'detached');
                });

              });
            }).observe(document.body, { childList: true, subtree: true });
          } else {
            on(document.body, 'DOMSubtreeModified', function () {
              for( var pluginSelector in handlers ) {
                runSelector(pluginSelector);
              }
            });
          }

          cb();
        });
      },
      liveListeners = [],
      $live = function (selector, handler, collection, cb) {
        if( typeof selector !== 'string' || !(handler instanceof Function) ) {
          throw new Error('required selector (string) and handler (function)');
        }

        if( collection instanceof Function ) {
          cb = collection;
          collection = false;
        }

        handlers[selector] = handler;
        handlers[selector]._collection = !!collection;

        if( liveRunning ) {
          runSelector(selector);
          (cb || noop)();
          return;
        }

        liveListeners.push(cb || noop);

        if( liveRunning === false ) {
          return;
        }

        liveRunning = false;
        initLive(function () {
          each.call(liveListeners, function (_cb) {
            _cb();
          });
          liveRunning = true;
        });
      };

  $live.useGlobal = function () {
    useParent = false;
  };

  $live.ready = ready;
  $live.on = on;
  $live.off = off;

  return $live;
}));
