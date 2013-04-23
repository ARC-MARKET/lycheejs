
lychee.define('game.entity.Text').requires([
	'lychee.Font'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var _font = lychee.Font;

	var Class = function(settings) {


		this.__text = null;
		this.__font = null;


		this.setFont(settings.font);
		this.setText(settings.text);


		delete settings.text;
		delete settings.font;

		settings.width  = this.width;
		settings.height = this.height;


		lychee.ui.Entity.call(this, 'game-text', settings);

	};


	Class.prototype = {

		setFont: function(font) {

			if (font instanceof _font) {
				this.__font = font;
				return true;
			}


			return false;

		},

		getFont: function() {
			return this.__font;
		},

		getText: function() {
			return this.__text;
		},

		setText: function(text) {

			if (typeof text === 'string') {

				this.__text = text;


				var width   = 0;
				var height  = 0;

				if (this.__font !== null) {

					var kerning = this.__font.getSettings().kerning;

					for (var t = 0, tl = text.length; t < tl; t++) {
						var chr = this.__font.get(text[t]);
						width += chr.real + kerning;
						height = Math.max(height, chr.height);
					}

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

