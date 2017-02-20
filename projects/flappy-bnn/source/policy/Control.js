
lychee.define('game.policy.Control').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = lychee.assignsafe({
			entity: null,
			target: null
		}, data);


		this.entity = settings.entity || null;
		this.target = settings.target || null;

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {
				entity: null,
				target: null
			};


			return {
				'constructor': 'game.policy.Control',
				'arguments':   [ settings ]
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
					}

				}

			}

		}

	};


	return Composite;

});

