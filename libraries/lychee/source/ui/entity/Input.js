
lychee.define('lychee.ui.entity.Input').includes([
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
				this.__buffer.resize(this.width - 16, this.height);
			} else {
				this.__buffer = renderer.createBuffer(this.width - 16, this.height);
			}


			renderer.clear(this.__buffer);
			renderer.setBuffer(this.__buffer);
			renderer.setAlpha(1.0);


			var lh     = font.lineheight;
			var buffer = this.__buffer;
			var text   = this.__value;
			var cur    = this.__cursor.map;
			var dim_x  = font.measure(text).width;
			if (dim_x > buffer.width) {

				renderer.drawText(
					buffer.width - dim_x,
					lh / 2,
					text,
					font,
					false
				);

				cur.x = buffer.width + cur.w / 2;

			} else {

				renderer.drawText(
					0,
					lh / 2,
					text,
					font,
					false
				);

				cur.x = dim_x;

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
		this.max   = Infinity;
		this.min   = 0;
		this.type  = Composite.TYPE.text;
		this.value = null;

		this.__buffer  = null;
		this.__cursor  = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			start:    null,
			pingpong: false,
			map: {
				x: 0,
				w: 10,
				h: 16
			}
		};
		this.__pulse   = {
			active:   false,
			duration: 300,
			start:    null,
			alpha:    0.0
		};
		this.__value   = '';
		this.__isDirty = true;


		this.setFont(settings.font);
		this.setMax(settings.max);
		this.setMin(settings.min);
		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.max;
		delete settings.min;
		delete settings.type;
		delete settings.value;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height :  32;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

		this.bind('touch', function() {}, this);

		this.bind('key', function(key, name, delta) {

			if (this.state === 'active') {

				var type = this.type;

				if (key === 'backspace') {

					var raw = this.__value.substr(0, this.__value.length - 1);

					if (type === Composite.TYPE.text) {

						this.__value = raw;

					} else if (type === Composite.TYPE.number) {

						var bsvalue = parseInt(raw, 10);
						if (!isNaN(bsvalue)) {
							this.__value = bsvalue + '';
						} else {
							this.__value = '';
						}

					}

					this.__isDirty = true;

					return;

				} else if (key === 'enter') {

					this.trigger('blur');

					return;

				} else if (key === 'space') {

					key = ' ';

				}


				if (key.length === 1) {

					if (type === Composite.TYPE.text && key.match(/([A-Za-z0-9\s+=-_#@$%*:.\(\)?!]+)/)) {

						this.__value = this.__value + key;

					} else if (type === Composite.TYPE.number && key.match(/[0-9-+]/)) {

						var value = parseInt('' + this.__value + key, 10);
						if (!isNaN(value)) {
							this.__value = value + '';
						} else {
							this.__value = '';
						}

					}

					this.__isDirty = true;

				}

			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {

			var oldvalue = this.value;
			var newvalue = null;


			var type = this.type;
			if (type === Composite.TYPE.text) {

				newvalue = this.__value;

				if (newvalue !== oldvalue) {

					if (this.setValue(newvalue) === false) {
						this.setValue(newvalue.substr(0, this.max));
					}

				}

			} else if (type === Composite.TYPE.number) {

				newvalue = parseInt(this.__value, 10);

				if (newvalue !== oldvalue && !isNaN(newvalue)) {

					if (this.setValue(newvalue) === false) {

						if (newvalue > this.max) {
							this.value     = this.max;
							this.__value   = this.max + '';
							this.__isDirty = true;
						} else if (newvalue < this.min) {
							this.value     = this.min;
 							this.__value   = this.min + '';
							this.__isDirty = true;
						}

					}

				}

			}


			if (oldvalue !== this.value) {
				this.trigger('change', [ this.value ]);
			}


			this.setState('default');

		}, this);


		settings = null;

	};


	Composite.TYPE = {
		text:   0,
		number: 1
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
			data['constructor'] = 'lychee.ui.entity.Input';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.max !== Infinity)         settings.max   = this.max;
			if (this.min !== 0)                settings.min   = this.min;
			if (this.type !== Composite.TYPE.text) settings.type  = this.type;
			if (this.value !== null)           settings.value = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var pt = (clock - pulse.start) / pulse.duration;
				if (pt <= 1) {
					pulse.alpha = (1 - pt);
				} else {
					pulse.alpha  = 0.0;
					pulse.active = false;
				}

			}


			var cursor = this.__cursor;
			if (cursor.active === true) {

				if (cursor.start === null) {
					cursor.start = clock;
				}


				var ct = (clock - cursor.start) / cursor.duration;
				if (ct <= 1) {
					cursor.alpha = cursor.pingpong === true ? (1 - ct) : ct;
				} else {
					cursor.start    = clock;
					cursor.pingpong = !cursor.pingpong;
				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;
			var x        = position.x + offsetX;
			var y        = position.y + offsetY;
			var hwidth   = (this.width  - 2) / 2;
			var hheight  = (this.height - 2) / 2;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			renderer.drawBox(
				x - hwidth,
				y - hheight,
				x + hwidth,
				y + hheight,
				this.state === 'active' ? '#32afe5' : '#545454',
				false,
				2
			);

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}


			if (this.__isDirty === true) {
				_render_buffer.call(this, renderer);
			}


			var cursor = this.__cursor;
			if (cursor.active === true) {

				var map = cursor.map;
				var cx1 = x - hwidth  + map.x + map.w / 2;
				var cy1 = y - hheight + 8;


				renderer.setAlpha(cursor.alpha);

				renderer.drawBox(
					cx1,
					cy1,
					cx1 + map.w,
					cy1 + map.h,
					'#32afe5',
					true
				);

				renderer.setAlpha(1.0);

			}


			var pulse = this.__pulse;
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

				renderer.setAlpha(1.0);

			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			if (this.__buffer !== null) {

				renderer.drawBuffer(
					x - hwidth + 8,
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

				this.__cursor.map.w = font.measure('_').realwidth;
				this.__cursor.map.h = font.measure('_').realheight;
				this.__isDirty      = true;


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

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var cursor = this.__cursor;
				var pulse  = this.__pulse;


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

				this.type = type;

				if (type === Composite.TYPE.text) {
					this.setValue('' + this.value);
				} else if (type === Composite.TYPE.number) {
					this.setValue(typeof this.value === 'string' ? parseInt(this.value, 10) : this.value);
				}


				return true;

			}


			return false;

		},

		setValue: function(value) {

			var type = this.type;


			// 0: Text
			if (type === Composite.TYPE.text && typeof value === 'string') {

				if (this.value !== value && value.length >= this.min && value.length <= this.max) {

					this.value = value;

					this.__value   = value + '';
					this.__isDirty = true;

					return true;

				}


			// 1. Number
			} else if (type === Composite.TYPE.number && typeof value === 'number' && !isNaN(value)) {

				if (this.value !== value && value >= this.min && value <= this.max) {

					this.value = value;

					this.__value   = value + '';
					this.__isDirty = true;

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

