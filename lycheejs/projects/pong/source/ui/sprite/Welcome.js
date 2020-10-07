
lychee.define('game.ui.sprite.Welcome').includes([
	'lychee.ui.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite  = lychee.import('lychee.ui.Sprite');
	const _TEXTURE = attachments['png'];
	const _CONFIG  = {
		width:  512,
		height: 256
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
			data['constructor'] = 'game.ui.sprite.Welcome';


			return data;

		}

	};


	return Composite;

});

