
lychee.define('game.entity.Board').requires([
	'game.entity.Tile'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	var _Layer   = lychee.import('lychee.ui.Layer');
	var _Tile    = lychee.import('game.entity.Tile');
	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.__statemap = _CONFIG.map['default'][0];


		settings.width  = _CONFIG.width;
		settings.height = _CONFIG.height;



		/*
		 * INITIALIZATION
		 */

		settings.entities = [];

		for (var e = 0; e < 9; e++) {

			var x = (e % 3) + 1;
			var y = Math.floor(e / 3) + 1;

			var posx = -96 + (x * 64 + 16 * x - 64);
			var posy = -96 + (y * 64 + 16 * y - 64);

			settings.entities.push(new _Tile({
				x:        x,
				y:        y,
				position: {
					x: posx,
					y: posy
				}
			}));

		}


		_Layer.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Board';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha = this.alpha;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			var texture = _TEXTURE || null;
			if (texture !== null) {

				var map = this.__statemap || null;
				if (map !== null) {

					var position = this.position;

					var x1 = position.x + offsetX - this.width  / 2;
					var y1 = position.y + offsetY - this.height / 2;


					renderer.drawSprite(
						x1,
						y1,
						texture,
						map
					);

				}

			}


			_Layer.prototype.render.call(this, renderer, offsetX, offsetY);


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		}

	};


	return Composite;

});

