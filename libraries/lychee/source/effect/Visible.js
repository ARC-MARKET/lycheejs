
lychee.define('lychee.effect.Visible').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.delay    = 0;
		this.visible  = true;

		this.__origin = null;
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.delay   = typeof settings.delay === 'number' ? (settings.delay | 0) : 0;
		this.visible = settings.visible === true;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};


			if (this.delay !== 0)      settings.delay   = this.delay;
			if (this.visible !== true) settings.visible = this.visible;


			return {
				'constructor': 'lychee.effect.Visible',
				'arguments':   [ settings ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

		},

		update: function(entity, clock, delta) {

			if (this.__start === null) {
				this.__start = clock;
			}


			let t = (clock - this.__start) / this.delay;
			if (t < 0) {
				return true;
			} else if (this.__origin === null) {
				this.__origin = entity.visible || false;
			}


			let origin  = this.__origin;
			let visible = this.visible;

			if (t <= 1) {

				entity.visible = origin;


				return true;

			} else {

				entity.visible = visible;


				return false;

			}

		}

	};


	return Composite;

});

