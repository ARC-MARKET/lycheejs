
lychee.define('app.entity.Room').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	var _Entity  = lychee.import('lychee.app.Entity');
	var _Sprite  = lychee.import('lychee.app.Sprite');
	var _CONFIG  = attachments["json"].buffer;
	var _TEXTURE = attachments["png"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.properties = {};


		settings.width   = 0;
		settings.height  = 0;
		settings.map     = _CONFIG.map;
		settings.shape   = _Entity.SHAPE.rectangle;
		settings.state   = settings.state || 'default';
		settings.states  = _CONFIG.states;
		settings.texture = _TEXTURE;


		this.setProperties(settings.properties);

		delete settings.properties;


		_Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.entity.Room';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setProperties: function(properties) {

			properties = properties instanceof Object ? properties : null;


			if (properties !== null) {

				this.properties = properties;


				return true;

			}


			return false;

		}

	};


	return Class;

});

