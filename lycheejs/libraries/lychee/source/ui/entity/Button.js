
lychee.define('lychee.ui.entity.Button').includes([
	'lychee.ui.Entity'
]).exports((lychee, global, attachments) => {

	const _Entity = lychee.import('lychee.ui.Entity');
	const _FONT   = attachments['fnt'];



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.label = null;
		this.font  = _FONT;
		this.value = null;

		this.__cursor = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			start:    null,
			pingpong: false
		};
		this.__pulse  = {
			active:   false,
			duration: 300,
			start:    null,
			alpha:    0.0
		};


		this.setFont(states.font);
		this.setLabel(states.label);
		this.setValue(states.value);

		delete states.font;
		delete states.label;
		delete states.value;


		states.width  = typeof states.width === 'number'  ? states.width  : 128;
		states.height = typeof states.height === 'number' ? states.height :  32;
		states.shape  = _Entity.SHAPE.rectangle;


		_Entity.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {
			this.trigger('change', [ this.value ]);
		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.state === 'active') {

				if (key === 'enter' || key === 'space') {

					this.trigger('change', [ this.value ]);

					return true;

				}

			}


			return false;

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
			data['constructor'] = 'lychee.ui.entity.Button';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.label !== null) states.label = this.label;
			if (this.value !== null) states.value = this.value;


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

				let t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {
					pulse.alpha = (1 - t);
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
				'#545454',
				true
			);


			let cursor = this.__cursor;
			if (cursor.active === true) {

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					'#32afe5',
					false,
					2
				);

				renderer.setAlpha(cursor.alpha);

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					'#32afe5',
					true
				);

				renderer.setAlpha(alpha);

			}


			let pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawBox(
					x - hwidth,
					y - hheight,
					x + hwidth,
					y + hheight,
					'#32afe5',
					true
				);

				renderer.setAlpha(alpha);

			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			let label = this.label;
			let font  = this.font;

			if (label !== null && font !== null) {

				renderer.drawText(
					x,
					y,
					label,
					font,
					true
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

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				this.label = label;

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

				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

