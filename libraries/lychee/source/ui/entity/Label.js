
lychee.define('lychee.ui.entity.Label').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	var _FONT = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.font  = _FONT;
		this.value = '';


		this.setFont(settings.font);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.value;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : this.width;
		settings.height = typeof settings.height === 'number' ? settings.height : this.height;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		// this.bind('touch', function() {
		// 	this.trigger('change', [ this.value ]);
		// }, this);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Label';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.value !== '') settings.value = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;


			var font  = this.font;
			var value = this.value;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (font !== null) {

				var cur = font.measure(value);
				var max = this.width;

				if (cur.realwidth <= max) {

					renderer.drawText(
						x,
						y,
						value,
						font,
						true
					);

				} else {

					var len = (max / cur.realwidth * value.length) | 0;
					var str = value.substr(0, len);

					renderer.drawText(
						x,
						y,
						str,
						font,
						true
					);

				}

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				// refresh the layout
				if (this.value !== '') {
					this.setValue(this.value);
				}

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				var font = this.font;
				if (font !== null) {

					var dim = font.measure(value);

					this.width  = dim.realwidth;
					this.height = dim.realheight;

				}


				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

