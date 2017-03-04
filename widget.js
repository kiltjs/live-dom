
// widgets

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory( require('./live-dom') );
  } else if (typeof define === 'function' && define.amd && typeof require === 'function') {
    require(['$live'], function ($live) {
      return factory($live);
    });
  } else {
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

  return $live.widget;

});
