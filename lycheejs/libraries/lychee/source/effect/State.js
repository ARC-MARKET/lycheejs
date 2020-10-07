
lychee.define('lychee.effect.State').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.delay = 0;
		this.state = null;

		this.__start = null;


		// No data validation garbage allowed for effects

		this.delay = typeof states.delay === 'number' ? (states.delay | 0) : 0;
		this.state = typeof states.state === 'string' ? states.state       : null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.delay !== 0)    states.delay = this.delay;
			if (this.state !== null) states.state = this.state;


			return {
				'constructor': 'lychee.effect.State',
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


			let state = this.state;

			if (t <= 1) {

				return true;

			} else if (state !== null) {

				if (typeof entity.setState === 'function') {

					// XXX: Allowing setState() using removeEffects()
					this.state = null;

					entity.setState(state);

				}


				return false;

			}

		}

	};


	return Composite;

});

