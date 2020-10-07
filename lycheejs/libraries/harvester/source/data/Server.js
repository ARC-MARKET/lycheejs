
lychee.define('harvester.data.Server').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.host = typeof states.host === 'string' ? states.host : null;
		this.port = typeof states.port === 'number' ? states.port : null;

		this.__process = states.process || null;


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.host !== null) states.host = this.host;
			if (this.port !== null) states.port = this.port;


			// XXX: native process instance can't be serialized :(


			return {
				'constructor': 'harvester.data.Server',
				'arguments':   [ states ]
			};

		},



		/*
		 * CUSTOM API
		 */

		destroy: function() {

			if (this.__process !== null) {

				this.__process.destroy();
				this.__process = null;

			}


			this.host = null;
			this.port = null;


			return true;

		}

	};


	return Composite;

});

