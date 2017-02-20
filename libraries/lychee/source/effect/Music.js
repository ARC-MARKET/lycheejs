
lychee.define('lychee.effect.Music').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.delay = 0;
		this.music = null;

		this.__start = null;


		// No data validation garbage allowed for effects

		this.delay = typeof settings.delay === 'number' ? (settings.delay | 0) : 0;
		this.music = settings.music instanceof Music    ? settings.music       : null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};


			if (this.delay !== 0)    settings.delay = this.delay;
			if (this.music !== null) settings.music = this.music;


			return {
				'constructor': 'lychee.effect.Music',
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

