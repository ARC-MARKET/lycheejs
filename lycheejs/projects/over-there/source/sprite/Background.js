
lychee.define('app.sprite.Background').includes([
	'lychee.app.sprite.Background'
]).exports((lychee, global, attachments) => {

	const _Background = lychee.import('lychee.app.sprite.Background');
	const _TEXTURE    = attachments['png'];
	const _CONFIG     = {
		repeat: true,
		states: { 'default': 0 },
		map:    { 'default': [{ x: 0, y: 0, w: 512, h: 512 }] }
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.map     = _CONFIG.map;
		states.repeat  = _CONFIG.repeat;
		states.states  = _CONFIG.states;
		states.texture = _TEXTURE;


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
			data['constructor'] = 'app.sprite.Background';


			return data;

		}

	};


	return Composite;

});

