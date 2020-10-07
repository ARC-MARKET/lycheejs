
lychee.define('game.app.sprite.Goal').requires([
	'game.app.sprite.Plane'
]).includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Plane   = lychee.import('game.app.sprite.Plane');
	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _CONFIG  = attachments['json'].buffer;
	const _TEXTURE = attachments['png'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, _CONFIG, data);


		states.texture  = _TEXTURE;
		states.position = {
			x: -4096,
			y: 0
		};
		states.velocity = {
			x: -256
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
			data['constructor'] = 'game.app.sprite.Goal';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		collides: function(plane) {

			plane = plane instanceof _Plane ? plane : null;


			if (plane !== null) {

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

			}


			return false;

		}

	};


	return Composite;

});

