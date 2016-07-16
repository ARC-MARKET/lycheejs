
lychee.define('lychee.effect.Velocity').exports(function(lychee, global, attachments) {

	var Composite = function(settings) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.velocity = { x: null, y: null, z: null };

		this.__origin = { x: null, y: null, z: null };
		this.__start  = null;


		// No data validation garbage allowed for effects

		var type     = lychee.enumof(Composite.TYPE, settings.type) ? settings.type           : null;
		var delay    = typeof settings.delay === 'number'       ? (settings.delay | 0)    : null;
		var duration = typeof settings.duration === 'number'    ? (settings.duration | 0) : null;
		var velocity = settings.velocity instanceof Object      ? settings.velocity       : null;

		if (type !== null) {
			this.type = type;
		}

		if (delay !== null) {
			this.delay = delay;
		}

		if (duration !== null) {
			this.duration = duration;
		}

		if (velocity !== null) {
			this.velocity.x = typeof velocity.x === 'number' ? (velocity.x | 0) : null;
			this.velocity.y = typeof velocity.y === 'number' ? (velocity.y | 0) : null;
			this.velocity.z = typeof velocity.z === 'number' ? (velocity.z | 0) : null;
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

			var settings = {};


			if (this.type !== Composite.TYPE.easeout) settings.type     = this.type;
			if (this.delay !== 0)                 settings.delay    = this.delay;
			if (this.duration !== 250)            settings.duration = this.duration;


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

				this.__start    = clock + this.delay;
				this.__origin.x = entity.velocity.x;
				this.__origin.y = entity.velocity.y;
				this.__origin.z = entity.velocity.z;

			}


			var t = (clock - this.__start) / this.duration;
			if (t < 0) {
				return true;
			}


			var origin    = this.__origin;
			var originx   = origin.x;
			var originy   = origin.y;
			var originz   = origin.z;

			var velocity  = this.velocity;
			var velocityx = velocity.x;
			var velocityy = velocity.y;
			var velocityz = velocity.z;

			var x         = originx;
			var y         = originy;
			var z         = originz;

			if (t <= 1) {

				var f  = 0;
				var dx = velocityx - originx;
				var dy = velocityy - originy;
				var dz = velocityz - originz;


				var type = this.type;
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

					var k = 1 - t;

					if ((k /= 1) < ( 1 / 2.75 )) {
						f = 1 * ( 7.5625 * Math.pow(k, 2) );
					} else if (k < ( 2 / 2.75 )) {
						f = 7.5625 * ( k -= ( 1.5   / 2.75 )) * k + 0.75;
					} else if (k < ( 2.5 / 2.75 )) {
						f = 7.5625 * ( k -= ( 2.25  / 2.75 )) * k + 0.9375;
					} else {
						f = 7.5625 * ( k -= ( 2.625 / 2.75 )) * k + 0.984375;
					}

					x += (1 - f) * dx;
					y += (1 - f) * dy;
					z += (1 - f) * dz;

				} else if (type === Composite.TYPE.bounceeaseout) {

					if ((t /= 1) < ( 1 / 2.75 )) {
						f = 1 * ( 7.5625 * Math.pow(t, 2) );
					} else if (t < ( 2 / 2.75 )) {
						f = 7.5625 * ( t -= ( 1.5   / 2.75 )) * t + 0.75;
					} else if (t < ( 2.5 / 2.75 )) {
						f = 7.5625 * ( t -= ( 2.25  / 2.75 )) * t + 0.9375;
					} else {
						f = 7.5625 * ( t -= ( 2.625 / 2.75 )) * t + 0.984375;
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

