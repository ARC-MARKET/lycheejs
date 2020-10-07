
lychee.define('lychee.policy.State').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.entity = states.entity instanceof Object ? states.entity : null;
		this.limit  = states.limit instanceof Array   ? states.limit  : [ 'default', 'active' ];

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {
				entity: null,
				limit:  this.limit
			};


			return {
				'constructor': 'lychee.policy.State',
				'arguments':   [ states ]
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

						return true;

					}

				}

			}


			return false;

		}

	};


	return Composite;

});

