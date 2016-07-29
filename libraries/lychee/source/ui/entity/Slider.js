
lychee.define('lychee.ui.entity.Slider').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	const _Entity = lychee.import('lychee.ui.Entity');
	const _FONT   = attachments["fnt"];



	/*
	 * HELPERS
	 */

	const _update_cursor = function() {

		let val  = this.value;
		let map  = this.__cursor.map;
		let type = this.type;


		if (val < this.min || val > this.max) {
			return;
		}


		if (type === Composite.TYPE.horizontal) {

			let vx = (val - this.min) / (this.max - this.min);

			map.x = vx * (this.width - 44);
			map.y = 0;

		} else if (type === Composite.TYPE.vertical) {

			let vy = (val - this.min) / (this.max - this.min);

			map.x = 0;
			map.y = vy * (this.height - 44);

		}


		this.__isDirty = false;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.font  = _FONT;
		this.max   = 128;
		this.min   = 0;
		this.step  = 1;
		this.type  = Composite.TYPE.horizontal;
		this.value = 0;

		this.__cursor  = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			start:    null,
			pingpong: false,
			map: {
				x: 0,
				y: 0
			}
		};
		this.__pulse   = {
			active:   false,
			duration: 300,
			start:    null,
			alpha:    0.0
		};
		this.__isDirty = true;


		this.setFont(settings.font);
		this.setMax(settings.max);
		this.setMin(settings.min);
		this.setStep(settings.step);
		this.setType(settings.type);

		delete settings.font;
		delete settings.max;
		delete settings.min;
		delete settings.step;
		delete settings.type;


		if (this.type === Composite.TYPE.horizontal) {
			settings.width  = typeof settings.width === 'number'  ? settings.width  : 192;
			settings.height = typeof settings.height === 'number' ? settings.height :  32;
		} else if (this.type === Composite.TYPE.vertical) {
			settings.width  = typeof settings.width === 'number'  ? settings.width  :  32;
			settings.height = typeof settings.height === 'number' ? settings.height : 192;
		}

		settings.shape = _Entity.SHAPE.rectangle;


		_Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

		this.bind('touch', function(id, position, delta) {

			let val  = null;
			let type = this.type;

			if (type === Composite.TYPE.horizontal) {

				let qx = Math.max(-0.5, Math.min(0.5, position.x / (this.width - 44))) + 0.5;
				let vx = (this.min + qx * (this.max - this.min)) | 0;

				val = ((vx / this.step) | 0) * this.step;

			} else if (type === Composite.TYPE.vertical) {

				let qy = Math.max(-0.5, Math.min(0.5, position.y / (this.height - 44))) + 0.5;
				let vy = (this.min + qy * (this.max - this.min)) | 0;

				val = ((vy / this.step) | 0) * this.step;

			}


			let result = this.setValue(val);
			if (result === true) {
				this.trigger('change', [ val ]);
			}

		}, this);

		this.bind('swipe', function(id, state, position, delta, swipe) {

			let val  = null;
			let step = this.step;
			let type = this.type;

			if (type === Composite.TYPE.horizontal) {

				let qx = Math.max(-0.5, Math.min(0.5, position.x / (this.width - 44))) + 0.5;
				let vx = (this.min + qx * (this.max - this.min)) | 0;

				val = ((vx / step) | 0) * step;

			} else if (type === Composite.TYPE.vertical) {

				let qy = Math.max(-0.5, Math.min(0.5, position.y / (this.height - 44))) + 0.5;
				let vy = (this.min + qy * (this.max - this.min)) | 0;

				val = ((vy / step) | 0) * step;

			}


			let result = this.setValue(val);
			if (result === true) {
				this.trigger('change', [ val ]);
			}

		}, this);

		this.bind('key', function(key, name, delta) {

			if (this.state === 'active') {

				let val  = this.value;
				let step = this.step;
				let type = this.type;

				if (type === Composite.TYPE.horizontal) {

					if (key === 'a' || key === 'arrow-left')  val -= step;
					if (key === 'd' || key === 'arrow-right') val += step;

				} else if (type === Composite.TYPE.vertical) {

					if (key === 'w' || key === 'arrow-up')    val -= step;
					if (key === 's' || key === 'arrow-down')  val += step;

				}


				if (key === 'space') val = this.min;
				if (key === 'enter') val = this.max;


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


		this.setValue(settings.value);

		settings = null;

	};


	Composite.TYPE = {
		horizontal: 0,
		vertical:   1
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
			data['constructor'] = 'lychee.ui.entity.Slider';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.max !== 100)                    settings.max   = this.max;
			if (this.min !== 0)                      settings.min   = this.min;
			if (this.step !== 1)                     settings.step  = this.step;
			if (this.type !== Composite.TYPE.horizontal) settings.type  = this.type;
			if (this.value !== 0)                    settings.value = this.value;


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


			if (this.__isDirty === true) {
				_update_cursor.call(this);
			}


			_Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let font     = this.font;
			let position = this.position;
			let type     = this.type;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = (this.width  - 2) / 2;
			let hheight  = (this.height - 2) / 2;


			let cursor = this.__cursor;
			let map = cursor.map;
			let cx  = 0;
			let cy  = 0;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			if (type === Composite.TYPE.horizontal) {

				cx  = x - hwidth  + map.x + 20;
				cy  = y - hheight + 15;


				renderer.drawLine(
					x - hwidth,
					y,
					cx - 12,
					y,
					this.state === 'active' ? '#32afe5' : '#545454',
					2
				);

				renderer.drawLine(
					cx + 12,
					y,
					x + hwidth,
					y,
					this.state === 'active' ? '#32afe5' : '#545454',
					2
				);

			} else if (type === Composite.TYPE.vertical) {

				cx  = x - hwidth  + 15;
				cy  = y - hheight + map.y + 20;


				renderer.drawLine(
					x,
					y - hheight,
					x,
					cy - 12,
					this.state === 'active' ? '#32afe5' : '#545454',
					2
				);

				renderer.drawLine(
					x,
					cy + 12,
					x,
					y + hheight,
					this.state === 'active' ? '#32afe5' : '#545454',
					2
				);

			}


			if (cursor.active === true) {

				renderer.drawCircle(
					cx,
					cy,
					11,
					'#32afe5',
					false,
					2
				);

				renderer.setAlpha(cursor.alpha);

				renderer.drawCircle(
					cx,
					cy,
					12,
					'#32afe5',
					true
				);

				renderer.setAlpha(alpha);


				if (type === Composite.TYPE.horizontal) {

					renderer.drawText(
						cx,
						cy - 6 - font.lineheight,
						'' + this.value,
						font,
						true
					);

				} else if (type === Composite.TYPE.vertical) {

					renderer.drawText(
						cx + 6 + font.measure('' + this.value).realwidth,
						cy,
						'' + this.value,
						font,
						true
					);

				}

			} else {

				renderer.drawCircle(
					cx,
					cy,
					11,
					'#545454',
					false,
					2
				);

			}


			let pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawCircle(
					cx,
					cy,
					12,
					'#32afe5',
					true
				);

				renderer.setAlpha(1.0);

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


				let map = this.__cursor.map;

				map.w = font.measure('_').realwidth;
				map.h = font.measure('_').realheight;


				return true;

			}


			return false;

		},

		setMax: function(max) {

			max = typeof max === 'number' ? max : null;


			if (max !== null) {

				this.max = max;

				return true;

			}


			return false;

		},

		setMin: function(min) {

			min = typeof min === 'number' ? min : null;


			if (min !== null) {

				this.min = min;

				return true;

			}


			return false;

		},

		setStep: function(step) {

			step = typeof step === 'number' ? step : null;


			if (step !== null) {

				this.step = step;

				return true;

			}


			return false;

		},

		setState: function(id) {

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


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				this.type      = type;
				this.__isDirty = true;


				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'number' ? value : null;


			if (value !== null) {

				if (value >= this.min && value <= this.max) {

					this.value     = value;
					this.__isDirty = true;


					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

