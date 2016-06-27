
require('./core.js')(__dirname);


(function(lychee, global) {

	var environment = lychee.deserialize(${blob});
	if (environment !== null) {
		lychee.envinit(environment, ${profile});
	}

})(lychee, typeof global !== 'undefined' ? global : this);

