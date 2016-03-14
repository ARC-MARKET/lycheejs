
lychee.define('lychee.ui.sprite.Emblem').includes([
	'lychee.ui.Sprite'
]).exports(function(lychee, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = {
		width:  256,
		height: 64
	};


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.texture = _TEXTURE;
		settings.width   = _CONFIG.width;
		settings.height  = _CONFIG.height;


		lychee.ui.Sprite.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('reshape', function(orientation, rotation, width, height) {
			this.position.y = 1/2 * height - _CONFIG.height / 2;
		}, this);


		settings = null;

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.ui.Sprite.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.sprite.Emblem';


			return data;

		}

	};


	return Class;

});

