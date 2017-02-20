
lychee.define('lychee.effect.Width').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.width    = 0;

		this.__origin = null;
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.type     = lychee.enumof(Composite.TYPE, settings.type) ? settings.type           : Composite.TYPE.easeout;
		this.delay    = typeof settings.delay === 'number'           ? (settings.delay | 0)    : 0;
		this.duration = typeof settings.duration === 'number'        ? (settings.duration | 0) : 250;
		this.width    = typeof settings.width === 'number'           ? (settings.width | 0)    : 0;

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

			let settings = {};


			if (this.type !== Composite.TYPE.easeout) settings.type     = this.type;
			if (this.delay !== 0)                     settings.delay    = this.delay;
			if (this.duration !== 250)                settings.duration = this.duration;
			if (this.width !== 0)                     settings.width    = this.width;


			return {
				'constructor': 'lychee.effect.Width',
				'arguments':   [ settings ]
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
				this.__origin = entity.width || 0;
			}


			let origin = this.__origin;
			let width  = this.width;
			let w      = origin;

			if (t <= 1) {

				let f  = 0;
				let dw = width - origin;


				let type = this.type;
				if (type === Composite.TYPE.linear) {

					w += t * dw;

				} else if (type === Composite.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					w += f * dw;

				} else if (type === Composite.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					w += f * dw;

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

					w += (1 - f) * dw;

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

					w += f * dw;

				}


				entity.width = w;


				return true;

			} else {

				entity.width = width;


				return false;

			}

		}

	};


	return Composite;

});

