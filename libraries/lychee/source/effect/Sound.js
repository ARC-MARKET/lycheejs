
lychee.define('lychee.effect.Sound').exports(function(lychee, global, attachments) {



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.delay = 0;
		this.sound = true;

		this.__start = null;


		// No data validation garbage allowed for effects

		let delay = typeof settings.delay === 'number' ? (settings.delay | 0) : null;
		let sound = settings.sound instanceof Sound    ? settings.sound       : null;

		if (delay !== null) {
			this.delay = delay;
		}

		if (sound !== null) {
			this.sound = sound;
		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};


			if (this.delay !== 0)    settings.delay = this.delay;
			if (this.sound !== null) settings.sound = this.sound;


			return {
				'constructor': 'lychee.effect.Sound',
				'arguments':   [ settings ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

		},

		update: function(entity, clock, delta) {

			if (this.__start === null) {
				this.__start  = clock;
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

