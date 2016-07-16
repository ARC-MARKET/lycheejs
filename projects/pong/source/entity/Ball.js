
lychee.define('game.entity.Ball').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	var _CONFIG  = attachments["json"].buffer;
	var _TEXTURE = attachments["png"];
	var _Sprite  = lychee.import('lychee.app.Sprite');



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, _CONFIG, data);


		settings.texture = _TEXTURE;


		_Sprite.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Ball';


			return data;

		}

	};


	return Composite;

});
