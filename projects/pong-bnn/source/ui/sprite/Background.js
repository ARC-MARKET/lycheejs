
lychee.define('game.ui.sprite.Background').includes([
	'lychee.ui.sprite.Background'
]).exports(function(lychee, global, attachments) {

	const _TEXTURE    = attachments["png"];
	const _CONFIG     = attachments["json"].buffer;
	const _Background = lychee.import('lychee.ui.sprite.Background');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


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

			let data = _Background.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.sprite.Background';


			return data;

		}

	};


	return Composite;

});

