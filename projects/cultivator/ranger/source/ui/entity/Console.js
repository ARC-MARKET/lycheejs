
lychee.define('app.ui.entity.Console').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	var _FONT   = attachments["fnt"];
	var _Entity = lychee.import('lychee.ui.Entity');



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


			var lines  = this.__lines;
			var buffer = this.__buffer;
			var x1     = 0;
			var x2     = buffer.width;
			var y1     = 0;
			var y2     = buffer.height;
			var lh     = font.lineheight;
			var ll     = lines.length;
			if (ll > 0) {

				for (var l = 0; l < ll; l++) {

					var line = lines[l];
					var type = line.substr(0, 3);

					if (type === '(I)') {

						renderer.drawBox(
							x1,
							y1 + lh * l,
							x2,
							y1 + lh * l + lh,
							'#4e9a06',
							true
						);

					} else if (type === '(W)') {

						renderer.drawBox(
							x1,
							y1 + lh * l,
							x2,
							y1 + lh * l + lh,
							'#c4a000',
							true
						);

					}


					renderer.drawText(
						x1,
						y1 + lh * l,
						line,
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

	var Class = function(data) {

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


		_Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

	};


	Class.prototype = {

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

			var data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.entity.Console';


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


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				'#1f2726',
				true
			);

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}


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


				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.value     = value;
				this.__lines   = value.split('\n').map(function(val) {
					return val.replace('\t',' ').replace('\\n','').trim();
				});
				this.__isDirty = true;


				return true;

			}


			return false;

		}

	};


	return Class;

});

