
lychee.define('lychee.effect.Event').exports(function(lychee, global, attachments) {

	var Class = function(settings) {

		this.delay = 0;
		this.event = null;

		this.__start = null;


		// No data validation garbage allowed for effects

		var delay = typeof settings.delay === 'number' ? (settings.delay | 0) : null;
		var event = typeof settings.event === 'string' ? settings.event       : null;

		if (delay !== null) {
			this.delay = delay;
		}

		if (event !== null) {
			this.event = event;
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
			if (this.event !== null) settings.event = this.event;


			return {
				'constructor': 'lychee.effect.Event',
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


			var event = this.event;

			if (t <= 1) {

				return true;

			} else {

				if (typeof entity.trigger === 'function') {
					entity.trigger(event, []);
				}


				return false;

			}

		}

	};


	return Class;

});

