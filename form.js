// forms

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

  var formRunning = null,
      formHandlers = {};

  $live.form = function (formName, handler) {
    formHandlers[formName] = handler;

    if( formRunning === null ) {

      formRunning = false;
      $live('form[name]', function () {
        if( formHandlers[this.name] ) {
          formHandlers[this.name].apply(this, arguments);
        }
      }, function () {
        formRunning = true;
      });

    } else if( formRunning ) {
      [].forEach.call(document.querySelectorAll('form[name="' + formName + '"]'), handler);
    }
  };

  return $live.form;

});
