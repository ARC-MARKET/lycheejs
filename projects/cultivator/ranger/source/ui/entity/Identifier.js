
lychee.define('app.ui.entity.Identifier').includes([
	'lychee.ui.entity.Label'
]).exports(function(lychee, global, attachments) {

	var _Label = lychee.import('lychee.ui.entity.Label');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		_Label.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Label.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.entity.Identifier';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;


			var x = position.x + offsetX;
			var y = position.y + offsetY;


			var font    = this.font;
			var value   = this.value;
			var hwidth  = this.width  / 2;
			var hheight = this.height / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (font !== null) {

				renderer.drawText(
					x - hwidth,
					y - (hheight - font.lineheight / 2),
					value,
					font,
					false
				);

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.value = value;


				return true;

			}


			return false;

		}

	};


	return Class;

});

