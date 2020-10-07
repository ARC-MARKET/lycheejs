
lychee.define('lychee.effect.Event').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.delay = 0;
		this.event = null;

		this.__start = null;


		// No data validation garbage allowed for effects

		this.delay = typeof states.delay === 'number' ? (states.delay | 0) : 0;
		this.event = typeof states.event === 'string' ? states.event       : null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.delay !== 0)    states.delay = this.delay;
			if (this.event !== null) states.event = this.event;


			return {
				'constructor': 'lychee.effect.Event',
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


			let event = this.event;

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


	return Composite;

});

