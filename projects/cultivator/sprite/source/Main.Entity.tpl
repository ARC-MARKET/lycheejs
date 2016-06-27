
lychee.define('app.entity.Entity').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, app, global, attachments) {

	var _texture = attachments["png"];
	var _config  = attachments["json"].buffer;


	var Class = function(data) {

		var settings = Object.assign({}, data);


		settings.texture = _texture;
		settings.width   = _config.width;
		settings.height  = _config.height;
		settings.map     = _config.map;
		settings.shape   = _config.shape;
		settings.states  = _config.states;
		settings.state   = settings.state || _config.state;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'app.entity.Entity';


			return data;

		}

	};


	return Class;

});

