
lychee.define('lychee.app.sprite.Emblem').includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = {
		width:  256,
		height: 64
	};


	var Composite = function(data) {

		var settings = Object.assign({}, data);


		settings.texture = _TEXTURE;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.sprite.Emblem';


			return data;

		}

	};


	return Composite;

});

