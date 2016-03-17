
lychee.define('harvester.data.Server').exports(function(lychee, harvester, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.host = settings.host || null;
		this.port = settings.port || null;

		this.__process = settings.process || null;


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.host !== null) settings.host = this.host;
			if (this.port !== null) settings.port = this.port;


			// XXX: native process instance can't be serialized :(


			return {
				'constructor': 'harvester.data.Server',
				'arguments':   [ settings ]
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

		}

	};


	return Class;

});

