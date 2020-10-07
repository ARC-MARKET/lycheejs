
lychee.define('game.policy.Position').exports((lychee, global, attachments) => {

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
				'constructor': 'game.policy.Position',
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

				let hly = limit.y / 2;

				values[0] = (hly + entity.position.y) / (hly * 2);

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let hly = limit.y / 2;

				entity.position.y = (values[0] * (hly * 2)) - hly;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

