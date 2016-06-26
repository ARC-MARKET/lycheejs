
lychee.define('game.app.sprite.Bullet').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	var _Entity  = lychee.import('lychee.app.Entity');
	var _Sprite  = lychee.import('lychee.app.Sprite');
	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		settings.collision = _Entity.COLLISION.A;
		settings.texture   = _TEXTURE;
		settings.map       = _CONFIG.map;
		settings.radius    = _CONFIG.radius;
		settings.shape     = _Entity.SHAPE.circle;
		settings.states    = _CONFIG.states;
		settings.state     = 'default';


		_Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.app.sprite.Bullet';


			return data;

		}

	};


	return Class;

});

