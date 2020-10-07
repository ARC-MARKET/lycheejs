
lychee.define('lychee.effect.Position').exports((lychee, global, attachments) => {

	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.type     = Composite.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.position = { x: null, y: null, z: null };

		this.__origin = { x: null, y: null, z: null };
		this.__start  = null;


		// No data validation garbage allowed for effects

		this.type     = lychee.enumof(Composite.TYPE, states.type) ? states.type           : Composite.TYPE.easeout;
		this.delay    = typeof states.delay === 'number'           ? (states.delay | 0)    : 0;
		this.duration = typeof states.duration === 'number'        ? (states.duration | 0) : 250;


		if (states.position instanceof Object) {
			this.position.x = typeof states.position.x === 'number' ? (states.position.x | 0) : null;
			this.position.y = typeof states.position.y === 'number' ? (states.position.y | 0) : null;
			this.position.z = typeof states.position.z === 'number' ? (states.position.z | 0) : null;
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


			if (this.position.x !== null || this.position.y !== null || this.position.z !== null) {

				states.position = {};

				if (this.position.x !== null) states.position.x = this.position.x;
				if (this.position.y !== null) states.position.y = this.position.y;
				if (this.position.z !== null) states.position.z = this.position.z;

			}


			return {
				'constructor': 'lychee.effect.Position',
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


			let origin    = this.__origin;
			let originx   = origin.x;
			let originy   = origin.y;
			let originz   = origin.z;

			let position  = this.position;
			let positionx = position.x;
			let positiony = position.y;
			let positionz = position.z;

			let x         = originx;
			let y         = originy;
			let z         = originz;

			if (t <= 1) {

				let f  = 0;
				let dx = positionx - originx;
				let dy = positiony - originy;
				let dz = positionz - originz;


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


				if (positionx !== null) entity.position.x = x;
				if (positiony !== null) entity.position.y = y;
				if (positionz !== null) entity.position.z = z;


				return true;

			} else {

				if (positionx !== null) entity.position.x = positionx;
				if (positiony !== null) entity.position.y = positiony;
				if (positionz !== null) entity.position.z = positionz;


				return false;

			}

		}

	};


	return Composite;

});

