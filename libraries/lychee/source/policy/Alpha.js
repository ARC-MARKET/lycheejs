
lychee.define('lychee.policy.Alpha').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.entity = null;
		this.limit  = typeof settings.limit === 'number' ? settings.limit : 1;


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
				'constructor': 'lychee.policy.Alpha',
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

			}

		}

	};


	return Composite;

});

