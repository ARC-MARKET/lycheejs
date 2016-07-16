
lychee.define('game.ui.sprite.Background').includes([
	'lychee.ui.sprite.Background'
]).exports(function(lychee, global, attachments) {

	var _TEXTURE    = attachments["png"];
	var _CONFIG     = attachments["json"].buffer;
	var _Background = lychee.import('lychee.ui.sprite.Background');



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		settings.color   = '#050a0d';
		settings.texture = _TEXTURE;
		settings.map     = _CONFIG.map;
		settings.states  = _CONFIG.states;
		settings.state   = 'default';


		_Background.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Background.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.sprite.Background';


			return data;

		}

	};


	return Composite;

});

