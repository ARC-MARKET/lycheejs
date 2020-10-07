
lychee.define('lychee.app.entity.Text').includes([
	'lychee.app.Entity'
]).exports((lychee, global, attachments) => {

	const _Entity = lychee.import('lychee.app.Entity');
	const _FONT   = attachments['fnt'];



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


			let lines = this.__lines;
			let lh    = font.lineheight;
			let ll    = lines.length;
			if (ll > 0) {

				for (let l = 0; l < ll; l++) {

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


		states.width  = this.width;
		states.height = this.height;
		states.shape  = lychee.app.Entity.SHAPE.rectangle;


		_Entity.call(this, states);

		states = null;

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
			data['constructor'] = 'lychee.app.entity.Text';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.value !== '') states.value = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			let alpha    = this.alpha;
			let position = this.position;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = this.width  / 2;
			let hheight  = this.height / 2;


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

				let font = this.font;
				if (font !== null) {

					let realwidth  = 0;
					let realheight = 0;
					let lines      = value.split('\n');

					lines.forEach(line => {

						let tmp = font.measure(line);
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

