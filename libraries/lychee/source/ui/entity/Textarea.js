
lychee.define('lychee.ui.entity.Textarea').includes([
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
				this.__buffer.resize(this.width - 16, this.height - 16);
			} else {
				this.__buffer = renderer.createBuffer(this.width - 16, this.height - 16);
			}


			renderer.clear(this.__buffer);
			renderer.setBuffer(this.__buffer);
			renderer.setAlpha(1.0);


			var lines  = this.__lines;
			var buffer = this.__buffer;
			var cur    = this.__cursor.map;
			var lh     = font.lineheight;
			var ll     = lines.length;
			if (ll > 0) {

				var dim_x = font.measure(lines[ll - 1]).width;
				var dim_y = ll * lh;
				var off_x = 0;
				var off_y = 0;


				if (dim_x > buffer.width)  {
					off_x = buffer.width - dim_x;
					cur.x = buffer.width;
				} else {
					cur.x = dim_x;
				}


				if (dim_y > buffer.height) {
					off_y = buffer.height - dim_y;
					cur.y = buffer.height - lh;
				} else {
					cur.y = dim_y - lh;
				}


				for (var l = 0; l < ll; l++) {

					renderer.drawText(
						off_x,
						off_y + lh * l,
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
		this.__cursor  = {
			active:   false,
			alpha:    0.0,
			duration: 600,
			start:    null,
			pingpong: false,
			map: {
				x: 0,
				y: 0,
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
		this.__lines   = [ '' ];
		this.__value   = '';
		this.__isDirty = true;


		this.setFont(settings.font);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.value;


		settings.width  = typeof settings.width  === 'number' ? settings.width  : 256;
		settings.height = typeof settings.height === 'number' ? settings.height : 128;
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

			var line      = this.__lines[this.__lines.length - 1];
			var character = key;

			if (key === 'enter') {

				this.__lines.push('');
				this.__isDirty = true;

				return false;

			} else {

				if (key === 'space') {
					character = ' ';
				} else if (key === 'tab') {
					character = '\t';
				}


				var ll = this.__lines.length;

				if (character.length === 1) {

					line += character;
					this.__lines[ll - 1] = line;
					this.__isDirty = true;

				} else if (key === 'backspace') {

					if (line.length > 0) {
						line = line.substr(0, line.length - 1);
						this.__lines[ll - 1] = line;
						this.__isDirty = true;
					} else if (ll > 1) {
						this.__lines.splice(ll - 1, 1);
						this.__isDirty = true;
					}

				}


				this.value = this.__lines.join('\n');

			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {

			if (this.value !== this.__value) {
				this.trigger('change', [ this.value ]);
				this.__value = this.value;
			}

			this.setState('default');

		}, this);


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
			data['constructor'] = 'lychee.ui.entity.Textarea';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.value !== '') settings.value = this.value;


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
				var cx1 = x - hwidth  + map.x + 8;
				var cy1 = y - hheight + map.y + 8;


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
					x - hwidth  + 8,
					y - hheight + 8,
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


				var map = this.__cursor.map;

				map.w = font.measure('_').realwidth;
				map.h = font.measure('_').realheight;


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

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

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

