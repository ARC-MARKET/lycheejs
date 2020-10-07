
lychee.define('lychee.ai.neat.Species').exports((lychee, global, attachments) => {

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states = null;

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.ai.neat.Species',
				'arguments':   []
			};

		}

	};


	return Composite;

});

