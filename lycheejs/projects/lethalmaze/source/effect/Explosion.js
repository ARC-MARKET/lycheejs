
lychee.define('game.effect.Explosion').exports((lychee, global, attachments) => {

	const _CONFIG  = attachments['json'].buffer;
	const _TEXTURE = attachments['png'];
	const _SOUND   = attachments['snd'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.delay    = 0;
		this.duration = 250;
		this.frame    = 7;
		this.position = { x: null, y: null, z: null };

		this.__frame  = 0;
		this.__map    = Math.random() > 0.5 ? _CONFIG.map['default'] : _CONFIG.map['fire'];
		this.__origin = 0;
		this.__start  = null;
		this.__sound  = true;


		this.delay    = typeof states.delay === 'number'    ? (states.delay | 0)    : 0;
		this.duration = typeof states.duration === 'number' ? (states.duration | 0) : 250;

		if (states.position !== null) {
			this.position.x = typeof states.position.x === 'number' ? (states.position.x | 0) : null;
			this.position.y = typeof states.position.y === 'number' ? (states.position.y | 0) : null;
			this.position.z = typeof states.position.z === 'number' ? (states.position.z | 0) : null;
		}

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.delay !== 0)      states.delay    = this.delay;
			if (this.duration !== 250) states.duration = this.duration;


			if (this.position.x !== null || this.position.y !== null || this.position.z !== null) {

				states.position = {};

				if (this.position.x !== null) states.position.x = this.position.x;
				if (this.position.y !== null) states.position.y = this.position.y;
				if (this.position.z !== null) states.position.z = this.position.z;

			}


			return {
				'constructor': 'game.effect.Explosion',
				'arguments':   [ states ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

			let t = (this.__clock - this.__start) / this.duration;
			if (t > 0 && t <= 1) {

				let frame    = (this.__frame | 0);
				let map      = this.__map[frame] || null;
				let position = this.position;

				if (map !== null) {

					let x1 = position.x + offsetX - map.w / 2;
					let y1 = position.y + offsetY - map.h / 2;


					renderer.drawSprite(
						x1,
						y1,
						_TEXTURE,
						map
					);

				}

			}

		},

		update: function(entity, clock, delta) {

			this.__clock = clock;


			if (this.__start === null) {
				this.__start = clock + this.delay;
			}


			let t = (clock - this.__start) / this.duration;
			if (t < 0) {

				return true;

			} else {

				if (this.__origin === null) {
					this.__origin = 0;
				}

				if (this.__sound === true) {
					this.__sound = false;
					_SOUND.play();
				}

			}


			let origin = this.__origin;
			let frame  = this.frame;
			let f      = origin;

			if (t <= 1) {

				f += t * (frame - origin);


				this.__frame = f;


				return true;

			} else {

				this.__frame = frame;


				return false;

			}

		}

	};


	return Composite;

});

