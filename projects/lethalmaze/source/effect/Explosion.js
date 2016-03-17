
lychee.define('game.effect.Explosion').exports(function(lychee, game, global, attachments) {

	var _CONFIG  = attachments["json"].buffer;
	var _TEXTURE = attachments["png"];
	var _SOUND   = attachments["snd"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.delay    = 0;
		this.duration = 250;
		this.frame    = 7;
		this.position = { x: null, y: null, z: null };

		this.__frame  = 0;
		this.__map    = Math.random() > 0.5 ? _CONFIG.map['default'] : _CONFIG.map['fire'];
		this.__origin = 0;
		this.__start  = null;
		this.__sound  = true;


		// No data validation garbage allowed for effects

		var delay    = typeof settings.delay === 'number'    ? (settings.delay | 0)    : null;
		var duration = typeof settings.duration === 'number' ? (settings.duration | 0) : null;
		var position = settings.position instanceof Object   ? settings.position       : null;

		if (delay !== null) {
			this.delay = delay;
		}

		if (duration !== null) {
			this.duration = duration;
		}

		if (position !== null) {
			this.position.x = typeof position.x === 'number' ? (position.x | 0) : null;
			this.position.y = typeof position.y === 'number' ? (position.y | 0) : null;
			this.position.z = typeof position.z === 'number' ? (position.z | 0) : null;
		}

	};


	Class.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.delay !== 0)      settings.delay    = this.delay;
			if (this.duration !== 250) settings.duration = this.duration;


			if (this.position.x !== null || this.position.y !== null || this.position.z !== null) {

				settings.position = {};

				if (this.position.x !== null) settings.position.x = this.position.x;
				if (this.position.y !== null) settings.position.y = this.position.y;
				if (this.position.z !== null) settings.position.z = this.position.z;

			}


			return {
				'constructor': 'game.effect.Explosion',
				'arguments':   [ settings ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

			var t = (this.__clock - this.__start) / this.duration;
			if (t > 0 && t <= 1) {

				var frame    = (this.__frame | 0);
				var map      = this.__map[frame] || null;
				var position = this.position;

				if (map !== null) {

					var x1 = position.x + offsetX - map.w / 2;
					var y1 = position.y + offsetY - map.h / 2;


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


			var t = (clock - this.__start) / this.duration;
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


			var origin = this.__origin;
			var frame  = this.frame;

			var f      = origin;

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


	return Class;

});

