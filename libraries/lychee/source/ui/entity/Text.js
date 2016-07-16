
lychee.define('lychee.ui.entity.Text').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	var _FONT = attachments["fnt"];



	/*
	 * HELPERS
	 */

	var _render_buffer = function(renderer) {

		var font = this.font;
		if (font !== null && font.texture !== null) {

			if (this.__buffer !== null) {
				this.__buffer.resize(this.width, this.height);
			} else {
				this.__buffer = renderer.createBuffer(this.width, this.height);
			}


			renderer.clear(this.__buffer);
			renderer.setBuffer(this.__buffer);
			renderer.setAlpha(1.0);


			var lines = this.__lines;
			var lh    = font.lineheight;
			var ll    = lines.length;
			if (ll > 0) {

				for (var l = 0; l < ll; l++) {

					renderer.drawText(
						0,
						0 + lh * l,
						lines[l],
						font,
						false
					);

				}

			}


			renderer.setBuffer(null);
			this.__isDirty = false;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.font  = _FONT;
		this.value = '';

		this.__buffer  = null;
		this.__lines   = [];
		this.__isDirty = true;


		this.setFont(settings.font);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.value;


		settings.width  = this.width;
		settings.height = this.height;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

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
			data['constructor'] = 'lychee.ui.entity.Text';

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
			var x        = position.x + offsetX;
			var y        = position.y + offsetY;
			var hwidth   = this.width  / 2;
			var hheight  = this.height / 2;


			if (this.__isDirty === true) {
				_render_buffer.call(this, renderer);
			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			if (this.__buffer !== null) {

				renderer.drawBuffer(
					x - hwidth,
					y - hheight,
					this.__buffer
				);

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

					var realwidth  = 0;
					var realheight = 0;
					var lines      = value.split('\n');

					lines.forEach(function(line) {

						var tmp = font.measure(line);
						if (tmp.realwidth  > realwidth)  realwidth  = tmp.realwidth;
						if (tmp.realheight > realheight) realheight = tmp.realheight;

					});

					this.width  = realwidth;
					this.height = realheight * lines.length;

				}


				this.value = value;

				this.__lines   = value.split('\n');
				this.__isDirty = true;


				return true;

			}


			return false;

		}

	};


	return Composite;

});

