
lychee.define('game.ui.sprite.Welcome').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = {
		width:  512,
		height: 256
	};
	var _Sprite  = lychee.import('lychee.ui.Sprite');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _TEXTURE;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;


		_Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.sprite.Welcome';


			return data;

		}

	};


	return Class;

});

