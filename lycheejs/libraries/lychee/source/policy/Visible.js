
lychee.define('lychee.policy.Visible').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.entity = states.entity instanceof Object ? states.entity : null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {
				entity: null
			};


			return {
				'constructor': 'lychee.policy.Visible',
				'arguments':   [ states ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let values = [ 0.5 ];


			if (entity !== null) {

				let visible = entity.visible;
				if (visible === true) {
					values[0] = 1;
				} else if (visible === false) {
					values[0] = 0;
				}

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;


			if (entity !== null) {

				if (values[0] > 0.5) {
					entity.visible = true;
				} else if (values[0] < 0.5) {
					entity.visible = false;
				}

				return true;

			}


			return false;

		}

	};


	return Composite;

});

