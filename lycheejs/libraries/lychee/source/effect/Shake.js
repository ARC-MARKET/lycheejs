
lychee.define('lychee.effect.Shake').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.shake    = { x: null, y: null, z: null };

		this.__origin = { x: null, y: null, z: null };
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.type     = lychee.enumof(Composite.TYPE, states.type) ? states.type           : Composite.TYPE.easeout;
		this.delay    = typeof states.delay === 'number'           ? (states.delay | 0)    : 0;
		this.duration = typeof states.duration === 'number'        ? (states.duration | 0) : 250;


		if (states.shake instanceof Object) {
			this.shake.x = typeof states.shake.x === 'number' ? (states.shake.x | 0) : null;
			this.shake.y = typeof states.shake.y === 'number' ? (states.shake.y | 0) : null;
			this.shake.z = typeof states.shake.z === 'number' ? (states.shake.z | 0) : null;
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

			let states = {};


			if (this.type !== Composite.TYPE.easeout) states.type     = this.type;
			if (this.delay !== 0)                     states.delay    = this.delay;
			if (this.duration !== 250)                states.duration = this.duration;


			if (this.shake.x !== null || this.shake.y !== null || this.shake.z !== null) {

				states.shake = {};

				if (this.shake.x !== null) states.shake.x = this.shake.x;
				if (this.shake.y !== null) states.shake.y = this.shake.y;
				if (this.shake.z !== null) states.shake.z = this.shake.z;

			}


			return {
				'constructor': 'lychee.effect.Shake',
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
			} else if (this.__origin.x === null) {
				this.__origin.x = entity.position.x || 0;
				this.__origin.y = entity.position.y || 0;
				this.__origin.z = entity.position.z || 0;
			}


			let origin  = this.__origin;
			let originx = origin.x;
			let originy = origin.y;
			let originz = origin.z;

			let shake   = this.shake;
			let shakex  = shake.x;
			let shakey  = shake.y;
			let shakez  = shake.z;

			let x       = originx;
			let y       = originy;
			let z       = originz;

			if (t <= 1) {

				let f   = 0;
				let pi2 = Math.PI * 2;
				let dx  = shakex;
				let dy  = shakey;
				let dz  = shakez;


				let type = this.type;
				if (type === Composite.TYPE.linear) {

					x += Math.sin(t * pi2) * dx;
					y += Math.sin(t * pi2) * dy;
					z += Math.sin(t * pi2) * dz;

				} else if (type === Composite.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					x += Math.sin(f * pi2) * dx;
					y += Math.sin(f * pi2) * dy;
					z += Math.sin(f * pi2) * dz;

				} else if (type === Composite.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					x += Math.sin(f * pi2) * dx;
					y += Math.sin(f * pi2) * dy;
					z += Math.sin(f * pi2) * dz;

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

					x += Math.sin((1 - f) * pi2) * dx;
					y += Math.sin((1 - f) * pi2) * dy;
					z += Math.sin((1 - f) * pi2) * dz;

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

					x += Math.sin(f * pi2) * dx;
					y += Math.sin(f * pi2) * dy;
					z += Math.sin(f * pi2) * dz;

				}


				if (shakex !== null) entity.position.x = x;
				if (shakey !== null) entity.position.y = y;
				if (shakez !== null) entity.position.z = z;


				return true;

			} else {

				if (shakex !== null) entity.position.x = originx;
				if (shakey !== null) entity.position.y = originy;
				if (shakez !== null) entity.position.z = originz;


				return false;

			}

		}

	};


	return Composite;

});

