
lychee.define('lychee.effect.Color').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _rgb_to_color = function(r, g, b) {

		let strr = r > 15 ? (r).toString(16) : '0' + (r).toString(16);
		let strg = g > 15 ? (g).toString(16) : '0' + (g).toString(16);
		let strb = b > 15 ? (b).toString(16) : '0' + (b).toString(16);

		return '#' + strr + strg + strb;

	};

	const _color_to_rgb = function(color) {

		let r = parseInt(color.substr(1, 2), 16) || 0;
		let g = parseInt(color.substr(3, 2), 16) || 0;
		let b = parseInt(color.substr(5, 2), 16) || 0;

		return [ r, g, b ];

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.color    = '#000000';

		this.__cache  = {
			color:  [ 0, 0, 0 ],
			origin: [ 0, 0, 0 ]
		};
		this.__origin = null;
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.type     = lychee.enumof(Composite.TYPE, settings.type)   ? settings.type           : Composite.TYPE.easeout;
		this.delay    = typeof settings.delay === 'number'             ? (settings.delay | 0)    : 0;
		this.duration = typeof settings.duration === 'number'          ? (settings.duration | 0) : 250;
		this.color    = /(#[AaBbCcDdEeFf0-9]{6})/.test(settings.color) ? settings.color          : '#000000';

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
			if (this.color !== '#000000')             settings.color    = this.color;


			return {
				'constructor': 'lychee.effect.Color',
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
				this.__origin = entity.color || '#000000';
				this.__cache.color  = _color_to_rgb(this.color);
				this.__cache.origin = _color_to_rgb(this.__origin);
			}


			let color  = this.__cache.color;
			let origin = this.__cache.origin;


			let r      = origin[0];
			let g      = origin[1];
			let b      = origin[2];


			if (t <= 1) {

				let f  = 0;
				let dr = color[0] - origin[0];
				let dg = color[1] - origin[1];
				let db = color[2] - origin[2];


				let type = this.type;
				if (type === Composite.TYPE.linear) {

					r += t * dr;
					g += t * dg;
					b += t * db;

				} else if (type === Composite.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					r += f * dr;
					g += f * dg;
					b += f * db;

				} else if (type === Composite.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					r += f * dr;
					g += f * dg;
					b += f * db;

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

					r += (1 - f) * dr;
					g += (1 - f) * dg;
					b += (1 - f) * db;

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

					r += f * dr;
					g += f * dg;
					b += f * db;

				}


				entity.color     = _rgb_to_color(r | 0, g | 0, b | 0);
				entity.__isDirty = true;


				return true;

			} else {

				entity.color     = this.color;
				entity.__isDirty = true;


				return false;

			}

		}

	};


	return Composite;

});

