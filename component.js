
// components

(function (root, factory) {
  if( typeof module === 'object' && module.exports ) {
    module.exports = factory( require('./live-selector') );
  } else if (typeof define === 'function' && define.amd && typeof require === 'function') {
    require(['$live'], function ($live) {
      factory($live);
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

  var bindInit = window.customElements ? function (tag, fn) {
    (new Function('tag', 'fn', // customElements v1
      // dinamic class name and preventing use special keyword 'class' when not supported
      'class ' + slugToClassCase(tag) + ' extends HTMLElement { super(); fn.call(this, this);' +
      'window.customElements.define(\'tag\', XComponent); }'
    ))(tag, fn);
  } : ( document.registerElement ? function (tag, fn) { // customElements v0
    var elementProto = Object.create(HTMLElement.prototype);
    elementProto.createdCallback = function () { fn.call(this, this); };
    try {
      document.registerElement(tag, { prototype: elementProto });
    } catch(err) {
      $live(tag, fn);
    }
  } : function (tag, fn) { // live-selector as a fallback
    $live(tag, fn);
  } );

  $live.component = function (tag, options) {
    if( typeof options === 'function' ) { bindInit(tag, options); return; }
    if( typeof options === 'string' ) options = { template: options };
    if( typeof options !== 'object' || options === null ) return;

    bindInit(tag, function () {
      if( options.template ) this.innerHTML = options.template;

      if( options.events ) {
        for( var key in options.events ) $live.on(this, key, options.events[key] );
      }

      if( typeof options.init === 'function' ) options.init.call(this, this);
    });
  };

});
