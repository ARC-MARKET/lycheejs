
lychee.define('lychee.ui.entity.Upload').tags({
	platform: 'node'
}).includes([
	'lychee.ui.entity.Button'
]).supports(function(lychee, global) {

	// XXX: This is a stub API
	// no possibility to Upload in node runtime

	return true;

}).exports(function(lychee, global, attachments) {



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
			label: 'UPLOAD'
		}, data);


		this.type  = Class.TYPE.asset;
		this.value = [];


		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.type;
		delete settings.value;


		lychee.ui.entity.Button.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function() {

			// TODO: Show file dialog

		}, this);

	};


	Class.TYPE = {
		all:     0,
		config:  1,
		font:    2,
		music:   3,
		sound:   4,
		texture: 5,
		stuff:   6
	};


	Class.prototype = {

		setType: function(type) {

			type = lychee.enumof(Class.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = value instanceof Array ? value : null;


			if (value !== null) {

				this.value = value.filter(function(asset) {

					if (asset instanceof global.Config)  return true;
					if (asset instanceof global.Font)    return true;
					if (asset instanceof global.Music)   return true;
					if (asset instanceof global.Sound)   return true;
					if (asset instanceof global.Texture) return true;
					if (asset instanceof global.Stuff)   return true;


					return false;

				});


				return true;

			}


			return false;

		}

	};


	return Class;

});

