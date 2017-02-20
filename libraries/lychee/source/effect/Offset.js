
lychee.define('lychee.effect.Offset').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.offset   = { x: null, y: null };

		this.__origin = { x: null, y: null };
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.type     = lychee.enumof(Composite.TYPE, settings.type) ? settings.type           : Composite.TYPE.easeout;
		this.delay    = typeof settings.delay === 'number'           ? (settings.delay | 0)    : 0;
		this.duration = typeof settings.duration === 'number'        ? (settings.duration | 0) : 250;


		if (settings.offset instanceof Object) {
			this.offset.x = typeof settings.offset.x === 'number' ? (settings.offset.x | 0) : null;
			this.offset.y = typeof settings.offset.y === 'number' ? (settings.offset.y | 0) : null;
		}

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


			if (this.offset.x !== null || this.offset.y !== null) {

				settings.offset = {};

				if (this.offset.x !== null) settings.offset.x = this.offset.x;
				if (this.offset.y !== null) settings.offset.y = this.offset.y;

			}


			return {
				'constructor': 'lychee.effect.Offset',
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
			} else if (this.__origin.x === null) {
				this.__origin.x = entity.offset.x || 0;
				this.__origin.y = entity.offset.y || 0;
			}


			let origin  = this.__origin;
			let originx = origin.x;
			let originy = origin.y;

			let offset  = this.offset;
			let offsetx = offset.x;
			let offsety = offset.y;

			let x       = originx;
			let y       = originy;

			if (t <= 1) {

				let f  = 0;
				let dx = offsetx - originx;
				let dy = offsety - originy;


				let type = this.type;
				if (type === Composite.TYPE.linear) {

					x += t * dx;
					y += t * dy;

				} else if (type === Composite.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					x += f * dx;
					y += f * dy;

				} else if (type === Composite.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					x += f * dx;
					y += f * dy;

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

					x += (1 - f) * dx;
					y += (1 - f) * dy;

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

					x += f * dx;
					y += f * dy;

				}


				if (offsetx !== null) entity.offset.x = x;
				if (offsety !== null) entity.offset.y = y;

				entity.__isDirty = true;


				return true;

			} else {

				if (offsetx !== null) entity.offset.x = offsetx;
				if (offsety !== null) entity.offset.y = offsety;

				entity.__isDirty = true;


				return false;

			}

		}

	};


	return Composite;

});

