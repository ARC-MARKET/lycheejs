
lychee.define('lychee.effect.Sound').exports(function(lychee, global, attachments) {

	var Class = function(settings) {

		this.delay = 0;
		this.sound = true;

		this.__start = null;


		// No data validation garbage allowed for effects

		var delay = typeof settings.delay === 'number' ? (settings.delay | 0) : null;
		var sound = settings.sound instanceof Sound    ? settings.sound       : null;

		if (delay !== null) {
			this.delay = delay;
		}

		if (sound !== null) {
			this.sound = sound;
		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


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


			var t = (clock - this.__start) / this.delay;
			if (t < 0) {
				return true;
			}


			if (t <= 1) {

				return true;

			} else {

				var sound = this.sound;
				if (sound !== null) {
					sound.play();
				}


				return false;

			}

		}

	};


	return Class;

});

