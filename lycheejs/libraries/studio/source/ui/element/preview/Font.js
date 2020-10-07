
lychee.define('studio.ui.element.preview.Font').includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _TEXT    = 'The quick brown fox jumps over the lazy dog?! ;*] \\_(-.+)_/ <{@.^}> %|#=~$'.split(' ');



	/*
	 * HELPERS
	 */

	const _render_buffer = function(renderer) {

		let font = this.value;
		if (font !== null && font.texture !== null) {

			if (this.__buffer !== null) {
				this.__buffer.resize(this.width - 32, this.height - 144);
			} else {
				this.__buffer = renderer.createBuffer(this.width - 32, this.height - 144);
			}


			renderer.clear(this.__buffer);
			renderer.setBuffer(this.__buffer);
			renderer.setAlpha(1.0);


			let offset_x  = 0;
			let offset_y  = 0;
			let max_width = this.width - 2;


			for (let t = 0, tl = _TEXT.length; t < tl; t++) {

				let word = _TEXT[t] + (t < tl - 1 ? ' ' : '');
				let dim  = font.measure(word);
				if (dim !== null) {

					if (offset_x + dim.realwidth > max_width) {

						offset_y += dim.realheight;
						offset_x  = 0;

						renderer.drawText(
							offset_x,
							offset_y,
							word,
							font
						);

						offset_x += dim.realwidth;

					} else {

						renderer.drawText(
							offset_x,
							offset_y,
							word,
							font
						);

						offset_x += dim.realwidth;

					}

				}

			}


			offset_y += font.lineheight;


			let texture = font.texture;
			if (texture !== null) {

				renderer.drawBox(
					0,
					offset_y + 16,
					texture.width,
					offset_y + 16 + texture.height,
					'#1f2726',
					true
				);

				renderer.drawSprite(
					0,
					offset_y + 16,
					texture
				);

			}


			renderer.setBuffer(null);
			this.__isDirty = false;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.value = null;

		this.__buffer  = null;
		this.__isDirty = true;


		states.label   = 'Preview';
		states.options = [];


		_Element.call(this, states);


		this.setValue(states.value);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.preview.Font';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;

			_Element.prototype.render.call(this, renderer, offsetX, offsetY);


			let alpha    = this.alpha;
			let position = this.position;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = (this.width  - 2) / 2;
			let hheight  = (this.height - 2) / 2;


			if (this.__isDirty === true) {
				_render_buffer.call(this, renderer);
			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			if (this.__buffer !== null) {

				renderer.drawBuffer(
					x - hwidth  + 16,
					y - hheight + 80,
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

		setValue: function(value) {

			value = value instanceof Font ? value : null;


			if (value !== null) {

				this.value = value;
				this.setOptions([ 'Save' ]);
				this.__isDirty = true;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

