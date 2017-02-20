
lychee.define('game.entity.Goal').includes([
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


		settings.texture  = _TEXTURE;
		settings.position = {
			x: -4096,
			y: 0
		};
		settings.velocity = {
			x: -256
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
			data['constructor'] = 'game.entity.Goal';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		collidesWith: function(plane) {

			let px = plane.position.x;
			let py = plane.position.y;
			let pw = plane.width;
			let ph = plane.height;

			let x1 = this.position.x - this.width / 2;
			let x2 = this.position.x + this.width / 2;

			// XXX: Let planes go 8px into the boxes (40px bb w/h)
			let y1 = this.position.y - (this.height - 32 * 2) / 2;
			let y2 = this.position.y + (this.height - 32 * 2) / 2;


			if (px + pw / 2 > x1 && px - pw / 2 < x2) {

				if (py - ph / 2 > y1 && py + ph / 2 < y2) {
					return false;
				} else {
					return true;
				}

			}


			return false;

		}

	};


	return Composite;

});

