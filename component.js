
// components

(function (root, factory) {
  if( typeof module === 'object' && module.exports ) {
    module.exports = factory( require('./live-dom') );
  } else if (typeof define === 'function' && define.amd && typeof require === 'function') {
    require(['$live'], function ($live) {
      return factory($live);
    });
  } else {
    factory(root.$live);
  }
})(this, function ($live) {

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
      var _this = this;
      if( options.template ) _this.innerHTML = options.template;

      if( typeof options.controller === 'function' ) options.controller.call(_this, _this);
      else if( options.controller instanceof Array && typeof define === 'function' && define.amd && typeof require === 'function' ) {
        require( options.controller.slice(0, options.controller.length - 1), options.controller.slice(-1) );
      }

      if( options.events ) {
        for( var key in options.events ) $live.on(this, key, options.events[key] );
      }
    }, options.onDetach);
  };

  return $live.component;

});
