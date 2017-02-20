
lychee.define('game.entity.Plane').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _CONFIG  = attachments["json"].buffer;
	const _TEXTURE = attachments["png"];



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, _CONFIG, data);


		this.alive = true;

		this.__canflap = true;
		this.__timeout = null;


		settings.texture = _TEXTURE;
		settings.position = {
			x: 0,
			y: 0
		};
		settings.velocity = {
			x: 0,
			y: 0
		};


		_Sprite.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Plane';


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

			}

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

