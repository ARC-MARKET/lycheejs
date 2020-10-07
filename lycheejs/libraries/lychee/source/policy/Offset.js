
lychee.define('lychee.policy.Offset').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.entity = states.entity instanceof Object ? states.entity : null;
		this.limit  = { x: Infinity, y: Infinity };


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
				'constructor': 'lychee.policy.Offset',
				'arguments':   [ states ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let limit  = this.limit;
			let values = [ 0.5, 0.5 ];


			if (entity !== null) {

				let hlx = limit.x / 2;
				let hly = limit.y / 2;

				values[0] = (hlx + entity.offset.x) / (hlx * 2);
				values[1] = (hly + entity.offset.y) / (hly * 2);

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let hlx = limit.x / 2;
				let hly = limit.y / 2;

				entity.offset.x = (values[0] * (hlx * 2)) - hlx;
				entity.offset.y = (values[1] * (hly * 2)) - hly;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

