
lychee.define('game.app.sprite.Plane').includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _CONFIG  = attachments['json'].buffer;
	const _TEXTURE = attachments['png'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, _CONFIG, data);


		this.alive = true;

		this.__canflap = true;
		this.__timeout = null;


		states.texture = _TEXTURE;
		states.position = {
			x: 0,
			y: 0
		};
		states.velocity = {
			x: 0,
			y: 0
		};


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
			data['constructor'] = 'game.app.sprite.Plane';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		flap: function() {

			if (this.__canflap === true) {

				this.velocity.y = -256;

				this.__canflap  = false;
				this.__timeout  = null;


				return true;

			}


			return false;

		},

		update: function(clock, delta) {

			if (this.__timeout === null) {
				this.__timeout = clock + 250;
			} else if (clock > this.__timeout) {
				this.__canflap = true;
			}

			if (this.alive === true) {

				_Sprite.prototype.update.call(this, clock, delta);

				this.velocity.y += (delta / 1000) * 256 * 3;

			} else {

				let effects = this.effects;
				for (let e = 0, el = effects.length; e < el; e++) {

					let effect = effects[e];
					if (effect.update(this, clock, delta) === false) {
						this.removeEffect(effect);
						el--;
						e--;
					}

				}

			}

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.alive === true) {

				_Sprite.prototype.render.call(this, renderer, offsetX, offsetY);

			} else {

				let effects = this.effects;
				for (let e = 0, el = effects.length; e < el; e++) {
					effects[e].render(renderer, offsetX, offsetY);
				}

			}

		}

	};


	return Composite;

});

