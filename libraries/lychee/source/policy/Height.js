
lychee.define('lychee.policy.Height').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.entity = null;
		this.limit  = typeof settings.limit === 'number' ? (settings.limit | 0) : Infinity;

		// No data validation garbage allowed for policies

		if (settings.entity instanceof Object) {
			this.entity = settings.entity;
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
				'constructor': 'lychee.policy.Height',
				'arguments':   [ settings ]
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

				values[0] = (hl + entity.height) / (hl * 2);

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;
			let limit  = this.limit;


			if (entity !== null) {

				let hl = limit / 2;

				entity.height = (values[0] * (hl * 2)) - hl;

			}

		}

	};


	return Composite;

});

