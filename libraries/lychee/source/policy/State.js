
lychee.define('lychee.policy.State').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.entity = null;
		this.limit  = [ 'default', 'active' ];


		if (settings.entity instanceof Object) {
			this.entity = settings.entity;
		}

		if (settings.limit instanceof Array) {
			this.limit = settings.limit;
		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {
				entity: null,
				limit:  this.limit
			};


			return {
				'constructor': 'lychee.policy.State',
				'arguments':   [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [ 0.5 ];


			if (entity !== null) {

				let index = limit.indexOf(entity.state);
				if (index !== -1) {
					values[0] = (index / limit.length);
				}

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let index = (values[0] * limit.length) | 0;
				if (index >= 0) {

					if (typeof entity.setState === 'function') {
						entity.setState(limit[index]);
					}

				}

			}

		}

	};


	return Composite;

});

