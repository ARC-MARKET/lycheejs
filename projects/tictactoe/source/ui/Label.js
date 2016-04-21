
lychee.define('game.ui.Label').includes([
	'lychee.ui.entity.Label'
]).exports(function(lychee, global, attachments) {

	var _Label = lychee.import('lychee.ui.entity.Label');
	var _FONT  = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		settings.font = _FONT;


		_Label.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Label.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.Label';


			return data;

		}

	};


	return Class;

});

