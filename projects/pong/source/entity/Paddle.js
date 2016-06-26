
lychee.define('game.entity.Paddle').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	var _CONFIG   = attachments["json"].buffer;
	var _TEXTURES = {
		player: attachments["player.png"],
		enemy:  attachments["enemy.png"]
	};
	var _Sprite   = lychee.import('lychee.app.Sprite');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, _CONFIG, data);


		settings.texture = _TEXTURES[settings.state || 'player'];


		_Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Paddle';


			return data;

		}

	};


	return Class;

});
