// components

var $live = require('./live-dom');

function supportsAmd () {
  return typeof window.define === 'function' && window.define.amd && typeof window.require === 'function';
}

function slugToClassCase (tag) {
  return tag[0].toUpperCase() +
         tag.substr(1).replace(/-([a-z])/g, function (_matched, letter) {
           return letter.toUpperCase();
         });
}

function _initAttributeChanged (el, onAttributeChanged) {
  new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      onAttributeChanged(mutation.attributeName, mutation.oldValue, el.getAttribute(mutation.attributeName) );
    });
  }).observe(el, { attributes: true, attributeOldValue: true });
}

function _liveFallback (tag, fn, onDetach, onAttributeChanged) { // live-selector as a fallback
  // console.log('_liveFallback', tag, fn, onDetach, onAttributeChanged);
  $live(tag, (onDetach instanceof Function || onAttributeChanged instanceof Function) ? function (el) {
    fn.call(el, el);
    if( onDetach instanceof Function ) $live.on(el, 'detached', onDetach);
    if( onAttributeChanged instanceof Function ) _initAttributeChanged(el, onAttributeChanged);
  } : fn);
}

var bindInit = window.customElements ? function (tag, fn, onDetach, onAttributeChanged) {
  var classTag = slugToClassCase(tag);
  new Function('tag', 'fn', 'onDetach', 'onAttributeChanged', '_initAttributeChanged', // customElements v1
    // dinamic class name and preventing use special keyword 'class' when not supported
    'class ' + classTag + ' extends HTMLElement {' +
      '\nconstructor(){ super(); }\n' +
      // '\nconnectedCallback(){ fn.call(this, this); }\n' +
      '\nconnectedCallback(){ if( onAttributeChanged instanceof Function ) _initAttributeChanged(this, onAttributeChanged); fn.call(this, this); }\n' +
      ( ( onDetach instanceof Function ) ? '\ndisconnectedCallback(){ onDetach.call(this); }\n' : '' ) +
      // ( ( onAttributeChanged instanceof Function ) ? '\nattributeChangedCallback(){ onAttributeChanged.apply(this, arguments); }\n' : '' ) +
    '}\n' +
    'window.customElements.define(\'' + tag + '\', ' + classTag + ');'
  )(tag, fn, onDetach, onAttributeChanged, _initAttributeChanged);
} : ( document.registerElement ? function (tag, fn, onDetach, onAttributeChanged) { // customElements v0
  var elementProto = Object.create(HTMLElement.prototype);
  elementProto.createdCallback = function () {
    if( onAttributeChanged instanceof Function ) _initAttributeChanged(this, onAttributeChanged);
    fn.call(this, this);
  };
  if( onDetach instanceof Function )
    elementProto.detachedCallback = function () { onDetach.call(this, this); };
  try {
    document.registerElement(tag, { prototype: elementProto });
  } catch(err) {
    _liveFallback(tag, fn, onDetach, onAttributeChanged);
  }
} : _liveFallback );

$live.component = function (tag, options) {
  if( typeof options === 'function' ) { bindInit(tag, options); return; }
  else if( typeof options === 'string' ) options = { template: options };
  else if( typeof options !== 'object' || options === null ) return;

  bindInit(tag, function () {
    var _this = this, ctrl = options.controller;
    if( options.template ) _this.innerHTML = options.template;

    if( typeof ctrl === 'function' ) ctrl.call(_this, _this);
    else if( ctrl instanceof Array && supportsAmd() ) {
      (function (dependencies, ctrl) {
        window.require(dependencies, function () {
          ctrl.apply(_this, arguments);
        });
      })( ctrl.slice(0, ctrl.length - 1), ctrl[ctrl.length - 1] );
    }

    if( options.events ) {
      for( var key in options.events ) this.addEventListener(key, options.events[key]);
    }
  }, options.onDetach, options.onAttributeChanged );
};

module.exports = $live.component;
