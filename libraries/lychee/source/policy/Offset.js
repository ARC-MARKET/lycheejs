
lychee.define('lychee.policy.Offset').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.entity = null;
		this.limit  = { x: Infinity, y: Infinity };


		// No data validation garbage allowed for policies

		if (settings.entity instanceof Object) {
			this.entity = settings.entity;
		}

		if (settings.limit instanceof Object) {
			this.limit.x = typeof settings.limit.x === 'number' ? (settings.limit.x | 0) : Infinity;
			this.limit.y = typeof settings.limit.y === 'number' ? (settings.limit.y | 0) : Infinity;
			this.limit.z = typeof settings.limit.z === 'number' ? (settings.limit.z | 0) : Infinity;
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
				'constructor': 'lychee.policy.Offset',
				'arguments':   [ settings ]
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

			}

		}

	};


	return Composite;

});

