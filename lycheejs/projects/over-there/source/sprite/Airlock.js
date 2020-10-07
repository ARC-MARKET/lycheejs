
lychee.define('app.sprite.Airlock').includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _CONFIG  = attachments['json'].buffer;
	const _TEXTURE = attachments['png'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.width   = 0;
		states.height  = 0;
		states.map     = _CONFIG.map;
		states.state   = states.state || 'horizontal-big';
		states.states  = _CONFIG.states;
		states.texture = _TEXTURE;


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
			data['constructor'] = 'app.sprite.Airlock';


			return data;

		}

	};


	return Composite;

});

