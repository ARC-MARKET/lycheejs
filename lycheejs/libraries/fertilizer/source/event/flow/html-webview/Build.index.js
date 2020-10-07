
(function(lychee, global) {

	if (lychee === undefined) {

		try {

			let tmp = document.createElement('script');
			tmp.src       = './crux.js';
			tmp._filename = './crux.js';
			tmp.async     = false;
			document.head.appendChild(tmp);

		} catch (err) {
		}

	}


	let blob = ${blob};


	let environment = lychee.deserialize(blob);
	if (environment !== null) {
		environment.init();
	}

	lychee.ENVIRONMENTS['${id}'] = environment;

	return environment;

})(typeof lychee !== 'undefined' ? lychee : undefined, typeof global !== 'undefined' ? global : this);
