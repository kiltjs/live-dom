
// components

(function (factory) {

  function supportsAmd () {
    return typeof window.define === 'function' && window.define.amd && typeof window.require === 'function';
  }

  if( typeof module === 'object' && module.exports ) {
    module.exports = factory( require('./live-dom'), supportsAmd );
  } else if ( supportsAmd() ) {
    require(['$live'], function ($live) {
      return factory($live, supportsAmd);
    });
  } else {
    factory(window.$live, supportsAmd);
  }
})(function ($live, supportsAmd) {

  function slugToClassCase (tag) {
    return tag[0].toUpperCase() +
           tag.substr(1).replace(/-([a-z])/g, function (_matched, letter) {
             return letter.toUpperCase();
           });
  }

  var bindInit = window.customElements ? function (tag, fn, onDetach) {
    var classTag = slugToClassCase(tag);
    new Function('tag', 'fn', 'onDetach', // customElements v1
      // dinamic class name and preventing use special keyword 'class' when not supported
      'class ' + classTag + ' extends HTMLElement {' +
        '\nconstructor(){ super(); }\n' +
        '\nconnectedCallback(){ fn.call(this, this); }\n' +
        ( ( onDetach instanceof Function ) ? '\ndisconnectedCallback(){ onDetach.call(this); }\n' : '' ) +
      '}\n' +
      'window.customElements.define(\'' + tag + '\', ' + classTag + ');'
    )(tag, fn, onDetach);
  } : ( document.registerElement ? function (tag, fn, onDetach) { // customElements v0
    var elementProto = Object.create(HTMLElement.prototype);
    elementProto.createdCallback = function () { fn.call(this, this); };
    if( onDetach instanceof Function )
      elementProto.detachedCallback = function () { onDetach.call(this, this); };
    try {
      document.registerElement(tag, { prototype: elementProto });
    } catch(err) {
      $live(tag, onDetach instanceof Function ? function (el) {
        fn.call(el, el);
        $live.on(el, 'detached', onDetach);
      } : fn );
    }
  } : function (tag, fn, onDetach) { // live-selector as a fallback
    $live(tag, onDetach instanceof Function ? function (el) {
      fn.call(el, el);
      $live.on(el, 'detached', onDetach);
    } : fn);
  } );

  $live.component = function (tag, options) {
    if( typeof options === 'function' ) { bindInit(tag, options); return; }
    if( typeof options === 'string' ) options = { template: options };
    if( typeof options !== 'object' || options === null ) return;

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
        for( var key in options.events ) $live.on(this, key, options.events[key] );
      }
    }, options.onDetach);
  };

  return $live.component;

});
