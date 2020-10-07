
lychee.define('lychee.policy.Alpha').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.entity = states.entity instanceof Object  ? states.entity : null;
		this.limit  = typeof states.limit === 'number' ? states.limit  : 1;

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
				'constructor': 'lychee.policy.Alpha',
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

				let hl = limit / 2;

				values[0] = (hl + entity.alpha) / (hl * 2);

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let hl = limit / 2;

				entity.alpha = (values[0] * (hl * 2)) - hl;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

