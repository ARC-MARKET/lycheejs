
lychee.define('lychee.policy.Color').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _rgb_to_color = function(r, g, b) {

		let strr = r > 15 ? (r).toString(16) : '0' + (r).toString(16);
		let strg = g > 15 ? (g).toString(16) : '0' + (g).toString(16);
		let strb = b > 15 ? (b).toString(16) : '0' + (b).toString(16);

		return '#' + strr + strg + strb;

	};

	const _color_to_rgb = function(color) {

		let r = parseInt(color.substr(1, 2), 16) || 0;
		let g = parseInt(color.substr(3, 2), 16) || 0;
		let b = parseInt(color.substr(5, 2), 16) || 0;

		return [ r, g, b ];

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.entity = null;


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
				entity: null
			};


			return {
				'constructor': 'lychee.policy.Color',
				'arguments':   [ settings ]
			};

		},



		/*
		 * CUSTOM API
		 */

		sensor: function() {

			let entity = this.entity;
			let values = [ 0.5, 0.5, 0.5 ];


			if (entity !== null) {

				let color = _color_to_rgb(entity.color || '#000000');

				values[0] = color[0] / 256;
				values[1] = color[1] / 256;
				values[2] = color[2] / 256;

			}


			return values;

		},

		control: function(values) {

			let entity = this.entity;


			if (entity !== null) {

				entity.color = _rgb_to_color(
					(values[0] * 256) | 0,
					(values[1] * 256) | 0,
					(values[1] * 256) | 0
				);

			}

		}

	};


	return Composite;

});

