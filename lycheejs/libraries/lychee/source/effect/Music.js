
lychee.define('lychee.effect.Music').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.delay = 0;
		this.music = null;

		this.__start = null;


		// No data validation garbage allowed for effects

		this.delay = typeof states.delay === 'number' ? (states.delay | 0) : 0;
		this.music = states.music instanceof Music    ? states.music       : null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.delay !== 0)    states.delay = this.delay;
			if (this.music !== null) states.music = this.music;


			return {
				'constructor': 'lychee.effect.Music',
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

				let music = this.music;
				if (music !== null) {
					music.play();
				}


				return false;

			}

		}

	};


	return Composite;

});

