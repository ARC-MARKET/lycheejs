
lychee.define('game.policy.Ball').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = lychee.assignsafe({
			entity: null,
			limit:  {
				x: Infinity,
				y: Infinity,
				z: Infinity
			}
		}, data);


		this.entity = states.entity instanceof Object ? states.entity : null;
		this.limit  = states.limit instanceof Object  ? states.limit  : { x: Infinity, y: Infinity, z: Infinity };

		states = null;

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
				'constructor': 'game.policy.Ball',
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

				values[0] = (hx + entity.position.x) / (hx * 2);
				values[1] = (hy + entity.position.y) / (hy * 2);
				values[2] = (hz + entity.position.z) / (hz * 2);

			}

			return values;

		},

		control: function(values) {

			// XXX: Do nothing

			return false;

		}

	};


	return Composite;

});

