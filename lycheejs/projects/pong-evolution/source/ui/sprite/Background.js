
lychee.define('game.ui.sprite.Background').includes([
	'lychee.ui.sprite.Background'
]).exports((lychee, global, attachments) => {

	const _TEXTURE    = attachments['png'];
	const _CONFIG     = attachments['json'].buffer;
	const _Background = lychee.import('lychee.ui.sprite.Background');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.color   = '#050a0d';
		states.texture = _TEXTURE;
		states.map     = _CONFIG.map;
		states.states  = _CONFIG.states;
		states.state   = 'default';


		_Background.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Background.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.sprite.Background';


			return data;

		}

	};


	return Composite;

});

