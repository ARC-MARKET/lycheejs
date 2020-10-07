
lychee.define('lychee.ui.entity.Switch').includes([
	'lychee.ui.Entity'
]).exports((lychee, global, attachments) => {

	const _Entity = lychee.import('lychee.ui.Entity');
	const _FONT   = attachments['fnt'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.font    = _FONT;
		this.options = [ 'off', 'on' ];
		this.value   = '';

		this.__cursor = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			start:    null,
			pingpong: false
		};
		this.__pulse = {
			active:   false,
			duration: 300,
			start:    null,
			alpha:    0.0
		};


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



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			let q   = this.options.indexOf(this.value);
			let val = this.options[q === 0 ? 1 : 0] || null;


			let result = this.setValue(val);
			if (result === true) {
				this.trigger('change', [ val ]);
			}

		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.state === 'active') {

				let val = null;
				let q   = this.options.indexOf(this.value);

				if (key === 'a' || key === 'arrow-left')  val = this.options[0];
				if (key === 'd' || key === 'arrow-right') val = this.options[1];
				if (key === 'w' || key === 'arrow-up')    val = this.options[0];
				if (key === 's' || key === 'arrow-down')  val = this.options[1];


				if (key === 'enter' || key === 'space') {
					val = this.options[q === 0 ? 1 : 0];
				}


				let result = this.setValue(val);
				if (result === true) {
					this.trigger('change', [ val ]);
				}

			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		if (this.value === '') {
			this.setValue(this.options[0] || null);
		}

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
			data['constructor'] = 'lychee.ui.entity.Switch';

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
					pulse.alpha  = 0.0;
					pulse.active = false;
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
			let font     = this.font;
			let value    = this.value;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = this.width  / 2;
			let hheight  = this.height / 2;


			let x1 = x - hwidth;
			let y1 = y - hheight;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (cursor.active === true) {

				renderer.drawCircle(
					x1 + 16,
					y1 + 16,
					11,
					this.options.indexOf(value) === 1 ? '#32afe5' : '#545454',
					false,
					2
				);

				renderer.setAlpha(cursor.alpha);

				renderer.drawCircle(
					x1 + 16,
					y1 + 16,
					11,
					'#32afe5',
					true
				);

				renderer.setAlpha(1.0);

			} else {

				renderer.drawCircle(
					x1 + 16,
					y1 + 16,
					11,
					this.options.indexOf(value) === 1 ? '#32afe5' : '#545454',
					false,
					2
				);

			}


			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawCircle(
					x1 + 16,
					y1 + 16,
					12,
					'#32afe5',
					true
				);

				renderer.setAlpha(1.0);

			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			renderer.drawText(
				x1 + 36,
				y1 + (this.height - font.lineheight) / 2,
				'' + this.value,
				font,
				false
			);


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

			options = options instanceof Array ? options : null;


			if (options !== null && options.length === 2) {

				this.options = options.map(option => '' + option);

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

					pulse.alpha  = 1.0;
					pulse.start  = null;
					pulse.active = true;


					this.value = value;

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

