
lychee.define('game.entity.Paddle').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	const _Sprite   = lychee.import('lychee.app.Sprite');
	const _CONFIG   = attachments["json"].buffer;
	const _TEXTURES = {
		evil: attachments["evil.png"],
		good: attachments["good.png"]
	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, _CONFIG, data);


		settings.texture = _TEXTURES[settings.state || 'good'];


		_Sprite.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Paddle';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		moveTo: function(position) {

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


			return false;

		}

	};


	return Composite;

});
