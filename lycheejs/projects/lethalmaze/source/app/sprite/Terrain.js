
lychee.define('game.app.sprite.Terrain').requires([
	'lychee.app.Entity'
]).includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	const _Entity  = lychee.import('lychee.app.Entity');
	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _TEXTURE = attachments['png'];
	const _CONFIG  = attachments['json'].buffer;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.texture = _TEXTURE;
		states.map     = _CONFIG.map;
		states.width   = _CONFIG.width;
		states.height  = _CONFIG.height;
		states.shape   = _Entity.SHAPE.rectangle;
		states.states  = _CONFIG.states;
		states.state   = 'default';


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
			data['constructor'] = 'game.app.sprite.Terrain';


			return data;

		}

	};


	return Composite;

});

