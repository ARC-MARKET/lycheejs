
lychee.define('lychee.ui.Button').requires([
	'lychee.Font'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var _font = lychee.Font;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__label = null;
		this.__font  = null;


		if (
			settings.label !== undefined
			&& settings.font !== undefined
		) {
			this.setLabel(settings.label, settings.font);
		}


		delete settings.label;
		delete settings.font;


		// Needs to be precached, layouting taking place inside setLabel()
		settings.width  = this.width;
		settings.height = this.height;

		lychee.ui.Entity.call(this, 'ui-button', settings);

		settings = null;

	};


	Class.prototype = {

		getLabel: function() {
			return this.__label;
		},

		getFont: function() {
			return this.__font;
		},

		setLabel: function(label, font) {

			label = typeof label === 'string' ? label : null;
			font  = font instanceof _font ? font : this.__font;


			if (label !== null && font !== null) {

				this.__label = label;
				this.__font  = font;


				var width   = 0;
				var height  = 0;
				var kerning = font.getSettings().kerning;

				for (var l = 0, ll = label.length; l < ll; l++) {
					var chr = font.get(label[l]);
					width += chr.real + kerning;
					height = Math.max(height, chr.height);
				}

				this.width  = width;
				this.height = height;


				return true;

			}


			return false;

		}

	};


	return Class;

});

