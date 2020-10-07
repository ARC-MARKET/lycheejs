
lychee.define('lychee.effect.Visible').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.delay    = 0;
		this.visible  = true;

		this.__origin = null;
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.delay   = typeof states.delay === 'number' ? (states.delay | 0) : 0;
		this.visible = states.visible === true;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.delay !== 0)      states.delay   = this.delay;
			if (this.visible !== true) states.visible = this.visible;


			return {
				'constructor': 'lychee.effect.Visible',
				'arguments':   [ states ]
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

