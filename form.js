
// forms

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

});
