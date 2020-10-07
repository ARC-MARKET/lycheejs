
lychee.define('lychee.policy.Velocity').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.entity = states.entity instanceof Object ? states.entity : null;
		this.limit  = { x: Infinity, y: Infinity, z: Infinity };

		if (states.limit instanceof Object) {
			this.limit.x = typeof states.limit.x === 'number' ? (states.limit.x | 0) : Infinity;
			this.limit.y = typeof states.limit.y === 'number' ? (states.limit.y | 0) : Infinity;
			this.limit.z = typeof states.limit.z === 'number' ? (states.limit.z | 0) : Infinity;
		}

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
				'constructor': 'lychee.policy.Velocity',
				'arguments':   [ states ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [ 0.5, 0.5, 0.5 ];


			if (entity !== null) {

				let hx = limit.x / 2;
				let hy = limit.y / 2;
				let hz = limit.z / 2;

				values[0] = (hx + entity.velocity.x) / (hx * 2);
				values[1] = (hy + entity.velocity.y) / (hy * 2);
				values[2] = (hz + entity.velocity.z) / (hz * 2);

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let hx = limit.x / 2;
				let hy = limit.y / 2;
				let hz = limit.z / 2;

				entity.velocity.x = (values[0] * (hx * 2)) - hx;
				entity.velocity.y = (values[1] * (hy * 2)) - hy;
				entity.velocity.z = (values[2] * (hz * 2)) - hz;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

