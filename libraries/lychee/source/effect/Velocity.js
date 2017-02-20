
lychee.define('lychee.effect.Velocity').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.velocity = { x: null, y: null, z: null };

		this.__origin = { x: null, y: null, z: null };
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.type     = lychee.enumof(Composite.TYPE, settings.type) ? settings.type           : Composite.TYPE.easeout;
		this.delay    = typeof settings.delay === 'number'           ? (settings.delay | 0)    : 0;
		this.duration = typeof settings.duration === 'number'        ? (settings.duration | 0) : 250;


		if (settings.velocity instanceof Object) {
			this.velocity.x = typeof settings.velocity.x === 'number' ? (settings.velocity.x | 0) : null;
			this.velocity.y = typeof settings.velocity.y === 'number' ? (settings.velocity.y | 0) : null;
			this.velocity.z = typeof settings.velocity.z === 'number' ? (settings.velocity.z | 0) : null;
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


			if (this.velocity.x !== null || this.velocity.y !== null || this.velocity.z !== null) {

				settings.velocity = {};

				if (this.velocity.x !== null) settings.velocity.x = this.velocity.x;
				if (this.velocity.y !== null) settings.velocity.y = this.velocity.y;
				if (this.velocity.z !== null) settings.velocity.z = this.velocity.z;

			}


			return {
				'constructor': 'lychee.effect.Velocity',
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
				this.__origin.x = entity.velocity.x || 0;
				this.__origin.y = entity.velocity.y || 0;
				this.__origin.z = entity.velocity.z || 0;
			}


			let origin    = this.__origin;
			let originx   = origin.x;
			let originy   = origin.y;
			let originz   = origin.z;

			let velocity  = this.velocity;
			let velocityx = velocity.x;
			let velocityy = velocity.y;
			let velocityz = velocity.z;

			let x         = originx;
			let y         = originy;
			let z         = originz;

			if (t <= 1) {

				let f  = 0;
				let dx = velocityx - originx;
				let dy = velocityy - originy;
				let dz = velocityz - originz;


				let type = this.type;
				if (type === Composite.TYPE.linear) {

					x += t * dx;
					y += t * dy;
					z += t * dz;

				} else if (type === Composite.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					x += f * dx;
					y += f * dy;
					z += f * dz;

				} else if (type === Composite.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					x += f * dx;
					y += f * dy;
					z += f * dz;

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
					z += (1 - f) * dz;

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
					z += f * dz;

				}


				if (velocityx !== null) entity.velocity.x = x;
				if (velocityy !== null) entity.velocity.y = y;
				if (velocityz !== null) entity.velocity.z = z;


				return true;

			} else {

				if (velocityx !== null) entity.velocity.x = velocityx;
				if (velocityy !== null) entity.velocity.y = velocityy;
				if (velocityz !== null) entity.velocity.z = velocityz;


				return false;

			}

		}

	};


	return Composite;

});

