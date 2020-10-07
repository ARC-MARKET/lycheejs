
lychee.define('lychee.ui.entity.Select').includes([
	'lychee.ui.Entity'
]).exports((lychee, global, attachments) => {

	const _Entity = lychee.import('lychee.ui.Entity');
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


			let lh      = this.__height;
			let buffer  = this.__buffer;
			let options = this.options;

			for (let o = 0, ol = options.length; o < ol; o++) {

				let option   = options[o];
				let offset_y = o * lh;
				if (offset_y + lh > buffer.height) {
					break;
				}

				renderer.drawText(
					36,
					offset_y + (font.lineheight / 2) - 2,
					option,
					font,
					false
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


		this.font    = _FONT;
		this.options = [];
		this.value   = '';

		this.__buffer  = null;
		this.__cursor  = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			start:    null,
			pingpong: false
		};
		this.__height  = 32;
		this.__pulse   = {
			active:   false,
			duration: 300,
			start:    null,
			alpha:    0.0,
			previous: null
		};
		this.__isDirty = true;


		this.setFont(states.font);
		this.setOptions(states.options);
		this.setValue(states.value);

		delete states.font;
		delete states.options;
		delete states.value;


		states.width  = typeof states.width === 'number'  ? states.width  : 128;
		states.height = typeof states.height === 'number' ? states.height :  32;
		states.shape  = _Entity.SHAPE.rectangle;


		_Entity.call(this, states);

		states = null;


		if (this.height === 32 && this.options.length > 1) {
			this.__height = this.height;
			this.height   = this.options.length * this.__height;
		}


		if (this.value === '') {
			this.setValue(this.options[0] || null);
		}



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

		this.bind('touch', function(id, position, delta) {

			if (this.options.length === 0) return;


			let lh  = this.__height;
			let pos = (position.y + this.height / 2);

			let q = (pos / lh) | 0;
			if (q >= 0) {

				let option = this.options[q] || null;
				let result = this.setValue(option);
				if (result === true) {
					this.trigger('change', [ option ]);
				}

			}

		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.options.length === 0) return;


			if (this.state === 'active') {

				let option = null;
				let q      = this.options.indexOf(this.value);

				if (key === 'w' || key === 'arrow-up') {
					option = this.options[--q] || this.options[0];
				}

				if (key === 's' || key === 'arrow-down') {
					option = this.options[++q] || this.options[this.options.length - 1];
				}


				if (key === 'space') {
					option = this.options[0];
				}

				if (key === 'enter') {
					option = this.options[this.options.length - 1];
				}


				let result = this.setValue(option);
				if (result === true) {
					this.trigger('change', [ option ]);
				}

			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
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
			data['constructor'] = 'lychee.ui.entity.Select';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.options.length !== 0) states.options = Array.from(this.options);
			if (this.value !== '')         states.value   = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			let pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				let pt = (clock - pulse.start) / pulse.duration;
				if (pt <= 1) {
					pulse.alpha = (1 - pt);
				} else {
					pulse.alpha    = 0.0;
					pulse.active   = false;
					pulse.previous = null;
				}

			}


			let cursor = this.__cursor;
			if (cursor.active === true) {

				if (cursor.start === null) {
					cursor.start = clock;
				}


				let ct = (clock - cursor.start) / cursor.duration;
				if (ct <= 1) {
					cursor.alpha = cursor.pingpong === true ? (1 - ct) : ct;
				} else {
					cursor.start    = clock;
					cursor.pingpong = !cursor.pingpong;
				}

			}


			_Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let cursor   = this.__cursor;
			let pulse    = this.__pulse;
			let value    = this.value;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = this.width  / 2;
			let hheight  = this.height / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (this.__isDirty === true) {
				_render_buffer.call(this, renderer);
			}


			let x1 = x - hwidth;
			let y1 = y - hheight;
			let y2 = y + hheight;
			let lh = this.__height;


			for (let o = 0, ol = this.options.length; o < ol; o++) {

				let option   = this.options[o];
				let offset_y = y - hheight + o * lh;
				if (offset_y + lh > y2) {
					break;
				}


				if (pulse.active === true) {

					if (option === value) {

						renderer.drawCircle(
							x1 + 16,
							offset_y + 16,
							11,
							'#32afe5',
							false,
							2
						);

						renderer.setAlpha(pulse.alpha);

						renderer.drawCircle(
							x1 + 16,
							offset_y + 16,
							12,
							'#32afe5',
							true
						);

						renderer.setAlpha(alpha);

					} else if (option === pulse.previous) {

						renderer.drawCircle(
							x1 + 16,
							offset_y + 16,
							11,
							'#545454',
							false,
							2
						);

						renderer.setAlpha(pulse.alpha);

						renderer.drawCircle(
							x1 + 16,
							offset_y + 16,
							11,
							'#32afe5',
							false,
							2
						);

						renderer.setAlpha(alpha);

					} else {

						renderer.drawCircle(
							x1 + 16,
							offset_y + 16,
							11,
							'#545454',
							false,
							2
						);

					}

				} else {

					if (option === value) {

						renderer.drawCircle(
							x1 + 16,
							offset_y + 16,
							11,
							'#32afe5',
							false,
							2
						);


						if (cursor.active === true) {

							renderer.setAlpha(cursor.alpha);

							renderer.drawCircle(
								x1 + 16,
								offset_y + 16,
								12,
								'#32afe5',
								true
							);

							renderer.setAlpha(alpha);

						}

					} else {

						renderer.drawCircle(
							x1 + 16,
							offset_y + 16,
							11,
							'#545454',
							false,
							2
						);

					}

				}

			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			if (this.__buffer !== null) {

				renderer.drawBuffer(
					x1,
					y1,
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

		setOptions: function(options) {

			options = options instanceof Array ? options.unique() : null;


			if (options !== null) {

				this.options = options.map(option => '' + option);


				if (this.options.includes(this.value) === false) {

					let result = this.setValue(this.options[0] || null);
					if (result === true) {
						this.trigger('change', [ this.value ]);
					}

				}


				return true;

			}


			return false;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				let result = _Entity.prototype.setState.call(this, id);
				if (result === true) {

					let cursor = this.__cursor;
					let pulse  = this.__pulse;


					if (id === 'active') {

						cursor.start  = null;
						cursor.active = true;

						pulse.alpha   = 1.0;
						pulse.start   = null;
						pulse.active  = true;

					} else {

						cursor.active = false;

					}


					return true;

				}

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				if (this.options.indexOf(value) !== -1) {

					let pulse = this.__pulse;

					pulse.alpha    = 1.0;
					pulse.start    = null;
					pulse.active   = true;
					pulse.previous = this.value;


					this.value = value;

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

