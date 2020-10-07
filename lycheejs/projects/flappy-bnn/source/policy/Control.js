
lychee.define('game.policy.Control').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = lychee.assignsafe({
			entity: null,
			target: null
		}, data);


		this.entity = states.entity instanceof Object ? states.entity : null;
		this.target = states.target instanceof Object ? states.target : null;

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
				target: null
			};


			return {
				'constructor': 'game.policy.Control',
				'arguments':   [ states ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let target = this.target;
			let values = [ 0.5 ];


			if (entity !== null && target !== null) {

				let ey = entity.position.y;
				let ty = target.position.y;

				if (ty < ey) {
					values[0] = 1;
				} else {
					values[0] = 0;
				}

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;


			if (entity !== null) {

				let val = values[0];
				if (val > 0.5) {

					if (typeof entity.flap === 'function') {

						entity.flap();

						return true;

					}

				}

			}


			return false;

		}

	};


	return Composite;

});

