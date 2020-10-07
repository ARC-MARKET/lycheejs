
lychee.define('lychee.effect.Alpha').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.alpha    = 1;

		this.__origin = null;
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.type     = lychee.enumof(Composite.TYPE, states.type) ? states.type           : Composite.TYPE.easeout;
		this.delay    = typeof states.delay === 'number'           ? (states.delay | 0)    : 0;
		this.duration = typeof states.duration === 'number'        ? (states.duration | 0) : 250;
		this.alpha    = typeof states.alpha === 'number'           ? states.alpha          : 1;

	};


	Composite.TYPE = {
		linear:        0,
		easein:        1,
		easeout:       2,
		bounceeasein:  3,
		bounceeaseout: 4
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.type !== Composite.TYPE.easeout) states.type     = this.type;
			if (this.delay !== 0)                     states.delay    = this.delay;
			if (this.duration !== 250)                states.duration = this.duration;
			if (this.alpha !== 1)                     states.alpha    = this.alpha;


			return {
				'constructor': 'lychee.effect.Alpha',
				'arguments':   [ states ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

		},

		update: function(entity, clock, delta) {

			if (this.__start === null) {
				this.__start = clock + this.delay;
			}


			let t = (clock - this.__start) / this.duration;
			if (t < 0) {
				return true;
			} else if (this.__origin === null) {
				this.__origin = typeof entity.alpha === 'number' ? entity.alpha : 1;
			}


			let origin = this.__origin;
			let alpha  = this.alpha;

			let a      = origin;

			if (t <= 1) {

				let f  = 0;
				let da = alpha - origin;


				let type = this.type;
				if (type === Composite.TYPE.linear) {

					a += t * da;

				} else if (type === Composite.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					a += f * da;

				} else if (type === Composite.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					a += f * da;

				} else if (type === Composite.TYPE.bounceeasein) {

					let k = 1 - t;

					if ((k /= 1) < (1 / 2.75)) {
						f = 1 * (7.5625 * Math.pow(k, 2));
					} else if (k < (2 / 2.75)) {
						f = 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
					} else if (k < (2.5 / 2.75)) {
						f = 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
					} else {
						f = 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
					}

					a += (1 - f) * da;

				} else if (type === Composite.TYPE.bounceeaseout) {

					if ((t /= 1) < (1 / 2.75)) {
						f = 1 * (7.5625 * Math.pow(t, 2));
					} else if (t < (2 / 2.75)) {
						f = 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
					} else if (t < (2.5 / 2.75)) {
						f = 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
					} else {
						f = 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
					}

					a += f * da;

				}


				entity.alpha = a;


				return true;

			} else {

				entity.alpha = alpha;


				return false;

			}

		}

	};


	return Composite;

});

