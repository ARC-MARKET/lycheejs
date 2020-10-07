
lychee.define('game.app.sprite.Bullet').requires([
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


		states.collision = _Entity.COLLISION.A;
		states.texture   = _TEXTURE;
		states.map       = _CONFIG.map;
		states.radius    = _CONFIG.radius;
		states.shape     = _Entity.SHAPE.circle;
		states.states    = _CONFIG.states;
		states.state     = 'default';


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
			data['constructor'] = 'game.app.sprite.Bullet';


			return data;

		}

	};


	return Composite;

});

