
// widgets

var $live = require('./live-selector'),
    widgetRunning = null,
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

module.exports = $live.widget;