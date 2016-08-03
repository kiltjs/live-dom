
// forms

var $live = require('./live-selector'),
	formRunning = null,
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