
lychee.define('game.ui.layer.Board').requires([
	'game.ui.sprite.Tile'
]).includes([
	'lychee.ui.Layer'
]).exports((lychee, global, attachments) => {

	const _Layer   = lychee.import('lychee.ui.Layer');
	const _Tile    = lychee.import('game.ui.sprite.Tile');
	const _TEXTURE = attachments['png'];
	const _CONFIG  = attachments['json'].buffer;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.__statemap = {
			x: 0,
			y: 0,
			w: 512,
			h: 512
		};


		states.width  = _CONFIG.width;
		states.height = _CONFIG.height;



		/*
		 * INITIALIZATION
		 */

		states.entities = [];

		for (let e = 0; e < 9; e++) {

			let x = (e % 3) + 1;
			let y = Math.floor(e / 3) + 1;

			let posx = -96 + (x * 64 + 16 * x - 64);
			let posy = -96 + (y * 64 + 16 * y - 64);

			states.entities.push(new _Tile({
				x:        x,
				y:        y,
				position: {
					x: posx,
					y: posy
				}
			}));

		}


		_Layer.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.layer.Board';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha = this.alpha;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			let texture = _TEXTURE || null;
			if (texture !== null) {

				let statemap = this.__statemap;
				let position = this.position;

				let x1 = position.x + offsetX - this.width  / 2;
				let y1 = position.y + offsetY - this.height / 2;


				renderer.drawSprite(
					x1,
					y1,
					texture,
					statemap
				);

			}


			_Layer.prototype.render.call(this, renderer, offsetX, offsetY);


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		}

	};


	return Composite;

});

