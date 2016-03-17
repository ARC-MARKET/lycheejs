
lychee.define('app.entity.Astronaut').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, app, global, attachments) {

	var _id       = 0;
	var _CONFIG   = attachments["json"].buffer;
	var _TEXTURES = [
		attachments["blue.png"],
		attachments["light.png"],
		attachments["green.png"],
		attachments["red.png"],
		attachments["orange.png"],
		attachments["pink.png"],
		attachments["purple.png"],
		attachments["yellow.png"]
	];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.properties = {};


		settings.width   = 32;
		settings.height  = 32;
		settings.map     = _CONFIG.map;
		settings.shape   = lychee.app.Entity.SHAPE.rectangle;
		settings.states  = _CONFIG.states;
		settings.state   = settings.state || _CONFIG.state;
		settings.texture = _TEXTURES[_id++];


		this.setProperties(settings.properties);

		delete settings.properties;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.entity.Astronaut';


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

