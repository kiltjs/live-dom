
// widgets

(function (root, factory) {
    if (typeof define === 'function' && define.amd && typeof require === 'function') {
        // AMD. Register as an anonymous module.
        require(['$live'], function ($live) {
          factory($live);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./live-selector'));
    } else {
        // Browser globals (root is window)
        factory(root.$live);
  }
})(this, function ($live) {

  var widgetRunning = null,
      widgetHandlers = {};

  $live.widget = function (widgetName, handler) {
    widgetHandlers[widgetName] = handler;

    if( widgetRunning === null ) {

      widgetRunning = false;
      $live('[data-widget]', function () {
        if( widgetHandlers[this.getAttribute('data-widget')] ) {
          widgetHandlers[this.getAttribute('data-widget')].apply(this, arguments);
        }
      }, function () {
        widgetRunning = true;
      });

    } else if( widgetRunning ) {
      [].forEach.call(document.querySelectorAll('[data-widget="' + widgetName + '"]'), handler);
    }
  };

});
