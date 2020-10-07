
lychee.define('game.app.sprite.Paddle').includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite   = lychee.import('lychee.app.Sprite');
	const _CONFIG   = attachments['json'].buffer;
	const _TEXTURES = {
		evil: attachments['evil.png'],
		good: attachments['good.png']
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, _CONFIG, data);


		states.texture = _TEXTURES[states.state || 'good'];


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
			data['constructor'] = 'game.app.sprite.Paddle';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		moveTo: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				let my_y = this.position.y;
				let to_y = position.y || null;
				if (to_y !== null && my_y !== to_y) {

					let velocity = this.velocity;


					if (to_y > my_y - 10 && to_y < my_y + 10) {

						velocity.y = 0;
						position.y = my_y;

					} else {

						if (to_y > my_y - 10) {
							velocity.y = 256;
						}

						if (to_y < my_y + 10) {
							velocity.y = -256;
						}

					}


					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});
