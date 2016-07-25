
lychee.define('game.entity.Tile').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, global, attachments) {

	var _Sprite  = lychee.import('lychee.ui.Sprite');
	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.x = settings.x;
		this.y = settings.y;


		settings.texture = _TEXTURE;
		settings.map     = _CONFIG.map;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;
		settings.shape   = lychee.ui.Entity.SHAPE.rectangle;
		settings.states  = _CONFIG.states;
		settings.state   = 'default';


		_Sprite.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Tile';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setState: function(state) {

			if (this.state === 'default' && state !== 'default') {

				return _Sprite.prototype.setState.call(this, state);

			} else if (state === 'default') {

				return _Sprite.prototype.setState.call(this, state);

			}


			return false;

		}

	};


	return Composite;

});

