
lychee.define('app.sprite.Midground').includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _TEXTURE = attachments['png'];
	const _CONFIG  = {
		states: { 'default': 0 },
		map:    { 'default': [{ x: 0, y: 0, w: 2048, h: 2048 }] }
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.repeat  = false;
		states.states  = _CONFIG.states;
		states.texture = _TEXTURE;
		states.map     = _CONFIG.map;
		states.position = { x: 0, y: 0 };


		_Sprite.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.sprite.Midground';


			return data;

		}

	};


	return Composite;

});

