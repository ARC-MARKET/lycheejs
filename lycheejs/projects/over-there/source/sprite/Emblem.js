
lychee.define('app.sprite.Emblem').includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _TEXTURE = attachments['png'];
	const _CONFIG  = {
		width:  256,
		height: 64
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.texture = _TEXTURE;
		states.width   = _CONFIG.width;
		states.height  = _CONFIG.height;


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
			data['constructor'] = 'app.sprite.Emblem';


			return data;

		}

	};


	return Composite;

});

