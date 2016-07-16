
lychee.define('game.app.sprite.Terrain').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	var _Entity  = lychee.import('lychee.app.Entity');
	var _Sprite  = lychee.import('lychee.app.Sprite');
	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		settings.texture = _TEXTURE;
		settings.map     = _CONFIG.map;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;
		settings.shape   = _Entity.SHAPE.rectangle;
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
			data['constructor'] = 'game.app.sprite.Terrain';


			return data;

		}

	};


	return Composite;

});

