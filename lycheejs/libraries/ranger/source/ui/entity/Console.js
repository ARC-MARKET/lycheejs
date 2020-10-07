
lychee.define('ranger.ui.entity.Console').includes([
	'lychee.ui.Entity'
]).exports((lychee, global, attachments) => {

	const _FONT   = attachments['fnt'];
	const _Entity = lychee.import('lychee.ui.Entity');



	/*
	 * HELPERS
	 */

	const _render_buffer = function(renderer) {

		let font = this.font;
		if (font !== null && font.texture !== null) {

			if (this.__buffer !== null) {
				this.__buffer.resize(this.width, this.height);
			} else {
				this.__buffer = renderer.createBuffer(this.width, this.height);
			}


			renderer.clear(this.__buffer);
			renderer.setBuffer(this.__buffer);
			renderer.setAlpha(1.0);


			let lines  = this.__lines;
			let buffer = this.__buffer;
			let x1     = 0;
			let x2     = buffer.width;
			let y1     = 0;
			let lh     = font.lineheight;
			let ll     = lines.length;
			if (ll > 0) {

				let start  = 0;
				let offset = 0;
				let height = ll * lh;
				if (height > buffer.height) {
					start = ll - Math.floor(buffer.height / lh);
				}

				for (let l = start; l < ll; l++) {

					let line = lines[l];
					let type = line.substr(0, 3);

					if (type === '(I)') {

						renderer.drawBox(
							x1,
							y1 + offset,
							x2,
							y1 + offset + lh,
							'#4e9a06',
							true
						);

					} else if (type === '(W)') {

						renderer.drawBox(
							x1,
							y1 + offset,
							x2,
							y1 + offset + lh,
							'#c4a000',
							true
						);

					} else if (type === '(E)') {

						renderer.drawBox(
							x1,
							y1 + offset,
							x2,
							y1 + offset + lh,
							'#cc0000',
							true
						);

					}


					renderer.drawText(
						x1,
						y1 + offset,
						line,
						font,
						false
					);

					offset = offset + lh;

				}

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


		this.font  = _FONT;
		this.value = '';

		this.__buffer  = null;
		this.__lines   = [];
		this.__isDirty = true;


		this.setFont(states.font);
		this.setValue(states.value);

		delete states.font;
		delete states.value;


		_Entity.call(this, states);

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

		deserialize: function(blob) {

			let font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'ranger.ui.entity.Console';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = this.width  / 2;
			let hheight  = this.height / 2;


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
				this.__isDirty = true;
				this.__lines   = value.split('\n').map(val => val.replace('\t', ' ').replace('\\n', '').trim());


				return true;

			}


			return false;

		}

	};


	return Composite;

});

