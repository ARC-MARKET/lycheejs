
lychee.define('game.app.sprite.Portal').requires([
	'lychee.app.Entity',
	'lychee.effect.Sound',
	'game.effect.Lightning'
]).includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Entity    = lychee.import('lychee.app.Entity');
	const _Lightning = lychee.import('game.effect.Lightning');
	const _Sound     = lychee.import('lychee.effect.Sound');
	const _Sprite    = lychee.import('lychee.app.Sprite');
	const _TEXTURE   = attachments['png'];
	const _CONFIG    = attachments['json'].buffer;
	const _SOUND     = attachments['snd'];



	/*
	 * HELPERS
	 */

	const _update_effects = function() {

		for (let e = 0; e < 8; e++) {

			let delay    = (e * Math.random() * 2000) | 0;
			let duration = (e * 2000 + Math.random() * 1000) | 0;
			let f        = Math.random() * 2 * Math.PI;
			let position = { x: Math.sin(f) * 64, y: Math.cos(f) * 64 };


			position.x *= Math.random() * 5;
			position.y *= Math.random() * 5;

			if (Math.random() > 0.5) position.x *= -1;
			if (Math.random() > 0.5) position.y *= -1;

			position.x = ((position.x / 32) | 0) * 32 + 16;
			position.y = ((position.y / 32) | 0) * 32 + 16;


			this.addEffect(new _Lightning({
				type:     _Lightning.TYPE.linear,
				duration: duration,
				delay:    delay,
				position: position
			}));

			this.addEffect(new _Sound({
				delay: delay,
				sound: _SOUND
			}));

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.collision = _Entity.COLLISION.A;
		states.texture   = _TEXTURE;
		states.map       = _CONFIG.map;
		states.width     = _CONFIG.width;
		states.height    = _CONFIG.height;
		states.shape     = _Entity.SHAPE.rectangle;
		states.states    = _CONFIG.states;
		states.state     = 'default';


		_Sprite.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.app.sprite.Portal';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			let texture = this.texture;
			if (texture !== null) {

				let alpha    = this.alpha;
				let position = this.position;

				let x1 = 0;
				let y1 = 0;


				if (alpha !== 1) {
					renderer.setAlpha(alpha);
				}


				let map = this.__map[this.state][this.frame] || null;
				if (map !== null) {

					x1 = position.x + offsetX - map.w / 2;
					y1 = position.y + offsetY - map.h / 2;

					renderer.drawSprite(
						x1,
						y1,
						texture,
						map
					);

				} else {

					let hw = (this.width / 2)  || this.radius;
					let hh = (this.height / 2) || this.radius;

					x1 = position.x + offsetX - hw;
					y1 = position.y + offsetY - hh;

					renderer.drawSprite(
						x1,
						y1,
						texture
					);

				}


				if (alpha !== 1) {
					renderer.setAlpha(1.0);
				}

			}


			_Entity.prototype.render.call(this, renderer, offsetX, offsetY);

		},

		update: function(clock, delta) {

			_Entity.prototype.update.call(this, clock, delta);


			if (this.effects.length === 0) {
				_update_effects.call(this);
			}

		}

	};


	return Composite;

});

