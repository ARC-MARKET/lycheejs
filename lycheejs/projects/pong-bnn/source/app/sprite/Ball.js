
lychee.define('game.app.sprite.Ball').includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _CONFIG  = attachments['json'].buffer;
	const _TEXTURE = attachments['png'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, _CONFIG, data);


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
			data['constructor'] = 'game.app.sprite.Ball';


			return data;

		}

	};


	return Composite;

});
