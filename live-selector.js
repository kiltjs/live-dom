/*
 * jq-plugin (vanilla-js version)
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Jesús Manuel Germade Castiñeiras <jesus@germade.es>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

if( !Element.prototype.addEventListener ) {
  if( Element.prototype.attachEvent ) {
    Element.prototype.addEventListener = function (eventName, listener) {
      return Element.prototype.attachEvent( 'on' + eventName, listener );
    };
    Element.prototype.removeEventListener = function (eventName, listener) {
      return Element.prototype.detachEvent( 'on' + eventName, listener );
    };
  } else {
    throw 'Browser not compatible with element events';
  }
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.$live = factory();
  }
}(this, function () {

  var each = [].forEach,
      noop = function (v) { return v; },
      readyListeners = [],
      initReady = function () {
        var listeners = readyListeners;
        readyListeners = undefined;
        each.call(listeners, function (cb) { cb(); });
        document.removeEventListener('DOMContentLoaded', initReady);
        window.removeEventListener('load', initReady);
      };

  document.addEventListener('DOMContentLoaded', initReady);
  window.addEventListener('load', initReady);

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

  function runSelector (pluginSelector) {
    var handler = handlers[pluginSelector],
        elements = filter( document.querySelectorAll(pluginSelector), pluginSelectorFilter(pluginSelector) );

    if( handler && elements.length ) {
      if( handler._collection ) {
        handler( elements );
      } else {
        each.call(elements, function (el, i){
          handler.call(el, el);
        });
      }
    }
  }

  var liveRunning = null,
      initLive = function (cb) {
        ready(function () {
          // console.debug('$live:ready', typeof cb );

          for( var pluginSelector in handlers ) {
            runSelector(pluginSelector);
          }

          document.body.addEventListener('DOMSubtreeModified', function (event) {
            for( var pluginSelector in handlers ) {
              runSelector(pluginSelector);
            }
          });

          
          cb();
        });
      },
      liveListeners = [],
      $live = function (selector, handler, collection, cb) {
        if( typeof selector !== 'string' || !(handler instanceof Function) ) {
          throw new Error('required selector (string) and handler (function)');
        }

        // console.log('$live', selector, typeof handler, typeof collection, typeof cb );

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
          // console.log('liveListeners', liveListeners.length);
          each.call(liveListeners, function (_cb) {
            _cb();
          });
          liveRunning = true;
        });
      };

  $live.ready = ready;

  return $live;
}));
