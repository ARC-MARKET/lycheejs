
lychee.define('fork.DIST').requires([
	'app.Main'
]).exports((lychee, global, attachments) => {

	const _Main = lychee.import('app.Main');


	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'fork.DIST',
				'arguments':   []
			};

		}

	};

	return Composite;

});

