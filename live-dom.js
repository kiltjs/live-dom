
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if ( 'define' in window && window.define.amd ) define([], factory);
  else window.$live = factory();
})(function () {

  var num_listeners = 0;

  function _getLive (root) {

    var listeners_all = [],
        listeners = {},
        ready_listeners = [],
        dom_is_ready = document.readyState === 'complete',
        each = Array.prototype.forEach,
        filter = Array.prototype.filter;

    function triggerEvent (element, eventName, data) {
      var event = document.createEvent('HTMLEvents');
      event.data = data;
      event.initEvent(eventName, true, true);
      element.dispatchEvent(event);
      return event;
    }

    function _remove_item (list, item) {
      for( var i = list.length - 1 ; i >= 0 ; i-- ) {
        if( item === list[i] ) list.splice(i, 1);
      }
    }

    function runListener (el, listener) {
      if( el.__live__ && el.__live__[listener.id] ) return;
      el.__live__ = el.__live__ || {};
      el.__live__[listener.id] = true;
      listener.fn.call(el, el);
    }

    function runSelector (selector) {
      each.call( document.querySelectorAll(selector), function (el) {
        listeners[selector].forEach(function (listener) {
          runListener(el, listener);
        });
      });
    }

    function _runListener (listener) { listener(); }

    function onNodesChanged () {
      for( var listener_selector in listeners ) runSelector(listener_selector);
      if( listeners_all.length ) listeners_all.forEach(_runListener);
    }

    function onDOMReady () {
      dom_is_ready = true;
      document.removeEventListener('DOMContentLoaded', onDOMReady);
      window.removeEventListener('load', onDOMReady);

      ready_listeners.forEach(_runListener);
      onNodesChanged();
    }

    if( !dom_is_ready ) {
      document.addEventListener('DOMContentLoaded', onDOMReady);
      window.addEventListener('load', onDOMReady);
    }

    function onReady (listener) {
      if( dom_is_ready ) return listener();
      ready_listeners.push(listener);
    }

    onReady(function () {
      var mutations_supported = 'MutationObserver' in window;
      if( mutations_supported ) {
        try{
          new MutationObserver(function(mutations) {
            onNodesChanged();

            mutations.forEach(function(mutation) {
              [].forEach.call(mutation.removedNodes, function (node) {
                triggerEvent(node, 'detached');
              });
            });

          }).observe(root, { childList: true, subtree: true });
        } catch(err) {
          mutations_supported = false;
        }
      }
      if( !mutations_supported ) {
        root.addEventListener('DOMSubtreeModified', onNodesChanged);
      }
      // eslint-disable-next-line
      // console.log('mutations ' + ( mutations_supported ? '' : 'UN' ) + 'supported');
    });

    function _live (selector, listener_fn) {
      if( selector instanceof Function ) return listeners_all.push(selector);

      if( typeof selector !== 'string' ) throw new Error('selector should be a String');
      if( !(listener_fn instanceof Function) ) throw new Error('listener should be a Function');

      var listener = { id: '_' + ++num_listeners, fn: listener_fn };

      listeners[selector] = listeners[selector] || [];
      listeners[selector].push(listener);

      if( dom_is_ready ) each.call( document.querySelectorAll(selector), function (el) {
        runListener(el, listener);
      });
    }

    _live.off = function (selector, listener) {
      if( selector instanceof Function ) return _remove_item(listeners_all, selector);

      if( typeof selector !== 'string' ) throw new Error('selector should be a String');
      if( !(listener instanceof Function) ) throw new Error('handler should be a Function');

      _remove_item(listeners, listener);
    };

    _live.byValue = function (selector, getValue) {
      var value_listeners = {},
          value_live_ready = false;

      return function (name, listener_fn) {
        var listener = {
          id: '_' + ++num_listeners, fn: listener_fn,
          filter: function (node) {
            return getValue.call(node, node) === name;
          }
        };

        value_listeners[name] = value_listeners[name] || [];
        value_listeners[name].push(listener);

        if( dom_is_ready && value_live_ready ) {
          each.call( filter.call(document.querySelectorAll(selector), listener.filter), function (el) {
            runListener(el, listener);
          });
        }

        if( value_live_ready ) return;

        value_live_ready = true;
        _live(selector, function (el) {
          for( var name in value_listeners ) {
            value_listeners[name].forEach(function (listener) {
              if( listener.filter(el) ) runListener(el, listener);
            });
          }
        });
      };
    };

    return _live;
  }

  var $live = _getLive(document.body);
  $live.root = _getLive;
  $live.form = $live.byValue('form[name]', function () { return this.name; });

  return $live;
});
