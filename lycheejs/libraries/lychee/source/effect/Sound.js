
lychee.define('lychee.effect.Sound').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.delay = 0;
		this.sound = null;

		this.__start = null;


		// No data validation garbage allowed for effects

		this.delay = typeof states.delay === 'number' ? (states.delay | 0) : 0;
		this.sound = states.sound instanceof Sound    ? states.sound       : null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.delay !== 0)    states.delay = this.delay;
			if (this.sound !== null) states.sound = this.sound;


			return {
				'constructor': 'lychee.effect.Sound',
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
			}


			if (t <= 1) {

				return true;

			} else {

				let sound = this.sound;
				if (sound !== null) {
					sound.play();
				}


				return false;

			}

		}

	};


	return Composite;

});

