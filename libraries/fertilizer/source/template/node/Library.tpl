
(function(lychee, global) {

	var environment = lychee.deserialize(${blob});
	if (environment !== null) {
		environment.init();
	}

	lychee.ENVIRONMENTS['${id}'] = environment;

})(lychee, typeof global !== 'undefined' ? global : this);

