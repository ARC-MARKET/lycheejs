
lychee.define('lychee.ui.sprite.Emblem').includes([
	'lychee.ui.Sprite'
]).exports((lychee, global, attachments) => {

	const _Sprite  = lychee.import('lychee.ui.Sprite');
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



		/*
		 * INITIALIZATION
		 */

		this.bind('reshape', function(orientation, rotation, width, height) {
			this.position.y = 1 / 2 * height - _CONFIG.height / 2;
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.sprite.Emblem';


			return data;

		}

	};


	return Composite;

});

