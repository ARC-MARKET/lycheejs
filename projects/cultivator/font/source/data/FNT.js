
lychee.define('tool.data.FNT').requires([
	'lychee.codec.JSON'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	var _JSON = lychee.import('lychee.codec.JSON');



	/*
	 * HELPERS
	 */

	var _defaults = {};

	(function(defaults) {

		defaults.family       = 'Ubuntu Mono';
		defaults.style        = 'normal';
		defaults.size         = 16;
		defaults.spacing      = 0;
		defaults.color        = '#ffffff';
		defaults.outline      = 0;
		defaults.outlinecolor = '#000000';
		defaults.charset      = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

	})(_defaults);


	var _Buffer = function(data, mode) {

		data = typeof data === 'string' ? _JSON.decode(new Buffer(data, 'utf8')) : null;
		mode = lychee.enumof(_Buffer.MODE, mode) ? mode : 0;


		var settings = Object.assign({}, data);


		var texture = settings.texture;
		if (typeof texture === 'string') {
			settings.texture = new Texture(texture);
			settings.texture.deserialize({ buffer: texture });
		}


		this.__data = {
			baseline:   0,
			charset:    _defaults.charset,
			kerning:    0,
			lineheight: 0,
			map:        [],
			spacing:    0,
			texture:    null
		};
		this.__mode = mode;


		this.setBaseline(settings.baseline);
		this.setCharset(settings.charset);
		this.setKerning(settings.kerning);
		this.setLineHeight(settings.lineheight);
		this.setMap(settings.map);
		this.setSpacing(settings.spacing);
		this.setTexture(settings.texture);


		settings = null;

	};


	_Buffer.MODE = {
		read:  0,
		write: 1
	};

	_Buffer.prototype = {

		getBlob: function() {
			return this.__data;
		},

		toString: function() {

			var tmp = Object.assign({}, this.__data);
			if (tmp.texture !== null) {
				tmp.texture = tmp.texture.url || null;
			}


			return _JSON.encode(tmp);

		},

		setBaseline: function(baseline) {

			baseline = typeof baseline === 'number' ? (baseline | 0) : null;


			if (baseline !== null) {

				this.__data.baseline = baseline;

				return true;

			}


			return false;

		},

		setCharset: function(charset) {

			charset = typeof charset === 'string' ? charset : null;


			if (charset !== null) {

				this.__data.charset = charset;

				return true;

			}


			return false;

		},

		setKerning: function(kerning) {

			kerning = typeof kerning === 'number' ? (kerning | 0) : null;


			if (kerning !== null) {

				this.__data.kerning = kerning;

				return true;

			}


			return false;

		},

		setLineHeight: function(lineheight) {

			lineheight = typeof lineheight === 'number' ? (lineheight | 0) : null;


			if (lineheight !== null) {

				this.__data.lineheight = lineheight;

				return true;

			}


			return false;

		},

		setMap: function(map) {

			map = map instanceof Array ? map : null;


			if (map !== null) {

				var filtered = [];

				for (var m = 0, ml = map.length; m < ml; m++) {

					var value = map[m];
					if (typeof value === 'number') {
						filtered[m] = value;
					} else {
						filtered[m] = parseInt(value, 10) || 0;
					}

				}

				this.__data.map = filtered;


				return true;

			}


			return false;

		},

		setSpacing: function(spacing) {

			spacing = typeof spacing === 'number' ? (spacing | 0) : null;


			if (spacing !== null) {

				this.__data.spacing = spacing;

				return true;

			}


			return false;

		},

		setTexture: function(texture, settings) {

			texture = texture instanceof Texture ? texture : null;


			if (texture !== null) {

				this.__data.texture = texture;

				return true;

			}


			return false;

		}

	};



	/*
	 * ENCODER and DECODER
	 */

	var _encode_buffer = function(buffer, data) {

		var settings     = Object.assign({}, _defaults, data);
		var measurements = {
			width:  0,
			height: 0,
			map:    []
		};



		/*
		 * 1. Measure approximate canvas dimensions
		 */

		(function() {

			var canvas  = document.createElement('canvas');
			var context = canvas.getContext('2d');

			measurements.width  = settings.spacing;
			measurements.height = settings.size * 3 + settings.outline * 2;

			context.font         = settings.style + ' ' + settings.size + 'px "' + settings.family + '"';
			context.textBaseline = 'top';

			for (var c = 0, cl = settings.charset.length; c < cl; c++) {

				var m = context.measureText(settings.charset[c]);
				var w = Math.max(1, Math.ceil(m.width)) + settings.outline * 2;

				measurements.map.push(w);
				measurements.width += w + settings.spacing * 2;

			}

		})();



		/*
		 * 2. Render Texture
		 */

		var baseline   = 0;
		var lineheight = 0;
		var texture    = null;


		(function() {

			var canvas = document.createElement('canvas');

			canvas.width  = measurements.width;
			canvas.height = measurements.height;


			var measure_baseline = function() {

				var data      = this.getImageData(0, 0, measurements.width, measurements.height);
				var baselines = [];
				var margin    = settings.spacing;

				for (var c = 0; c < settings.charset.length; c++) {

					var baseline = data.height;

					for (var x = margin; x < margin + measurements.map[c]; x++) {

						for (var y = 0; y < data.height / 2; y++) {

							if (baseline > y) {

								if (data.data[y * data.height * 4 + x * 4 + 3]) {
									baseline = y;
									break;
								}

							}

						}

					}

					margin += measurements.map[c] + settings.spacing * 2;
					baselines.push(baseline);

				}


				baselines.sort(function(a, b) {
					if (a < b) return -1;
					if (a > b) return  1;
					return 0;
				});


				// returns the minimum baseline
				return baselines[0];

			};

			var measure_margin = function() {

				var data  = this.getImageData(0, 0, measurements.width, measurements.height);
				var found = false;

				var mtop    = measurements.height;
				var mbottom = 0;

				var d, dl, y;

				for (d = 0, dl = data.data.length; d < dl; d += 4) {

					// var x = (d / 4) % data.width;
					y = Math.floor((d / 4) / data.width);

					if (y < mtop && data.data[d + 3] > 0) {
						mtop = y;
					}

					if (y > mbottom && data.data[d + 3] > 0) {
						mbottom = y;
					}

				}


				return {
					top:    mtop,
					bottom: measurements.height - mbottom
				};

			};

			var render_outline = function(offset) {

				offset = typeof offset === 'number' ? offset : 0;


				this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
				this.textBaseline = 'top';
				this.fillStyle    = settings.outlinecolor;


				var outline = settings.outline;
				var m       = settings.spacing;

				for (var c = 0; c < settings.charset.length; c++) {

					for (var x = -1 * outline; x <= outline; x++) {

						for (var y = -1 * outline; y <= outline; y++) {

							this.fillText(
								settings.charset[c],
								m      + x,
								offset + y
							);

						}

					}

					m += measurements.map[c] + settings.spacing * 2;

				}

			};

			var render_font = function(offset) {

				offset = typeof offset === 'number' ? offset : 0;


				this.font         = settings.style + ' ' + settings.size + 'px ' + '"' + settings.family + '"';
				this.textBaseline = 'top';


				var m = settings.spacing;

				for (var c = 0; c < settings.charset.length; c++) {

					this.fillStyle = settings.color;
					this.fillText(
						settings.charset[c],
						m,
						offset
					);

					m += measurements.map[c] + settings.spacing * 2;

				}

			};


			/*
			 * 2.1 Render Font + Outline
			 */

			if (settings.outline > 0) {
				render_outline.call(canvas.getContext('2d'), settings.size + settings.outline);
			}

			render_font.call(canvas.getContext('2d'), settings.size + settings.outline);



			/*
			 * 2.2 Measure Margin
			 */

			var margin = measure_margin.call(canvas.getContext('2d'));
			if (margin.top > 0 || margin.bottom > 0) {

				measurements.height = measurements.height - margin.top - margin.bottom;
				canvas.height       = 0;
				canvas.height       = measurements.height;


				if (settings.outline > 0) {
					render_outline.call(canvas.getContext('2d'), settings.size + settings.outline - margin.top);
				}

				render_font.call(canvas.getContext('2d'), settings.size + settings.outline - margin.top);

			}



			/*
			 * 2.3 Export Baseline and Texture
			 */

			baseline   = measure_baseline.call(canvas.getContext('2d'));
			lineheight = canvas.height;


			var blob = canvas.toDataURL('image/png');

			texture    = new Texture(blob);
			texture.deserialize({ buffer: blob });

		})();



		/*
		 * 3. Save Buffer
		 */

		buffer.setBaseline(baseline);
		buffer.setLineHeight(lineheight);
		buffer.setKerning(0);
		buffer.setMap(measurements.map);
		buffer.setTexture(texture);

	};

	var _encode = function(buffer, data) {

		if (data instanceof Object) {

			buffer.setBaseline(data.baseline);
			buffer.setCharset(data.charset);
			buffer.setKerning(data.kerning);
			buffer.setLineHeight(data.lineheight);
			buffer.setMap(data.map);
			buffer.setSpacing(data.spacing);


			if (data.texture instanceof Texture) {
				buffer.setTexture(data.texture);
			} else {
				_encode_buffer(buffer, data);
			}

		}

	};


	var _decode = function(buffer) {

		var value = buffer.getBlob();


//		value.baseline   = buffer.baseline;
//		value.charset    = buffer.charset;
//		value.kerning    = buffer.kerning;
//		value.lineheight = buffer.lineheight;
//		value.map        = buffer.map;
//		value.spacing    = buffer.spacing;


		if (value.texture === null) {
			value = undefined;
		}


		return value;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		// deserialize: function(blob) {}

		serialize: function() {

			return {
				'reference': 'tool.data.FNT',
				'blob':      null
			};

		},

		encode: function(data) {

			var buffer = new _Buffer('', _Buffer.MODE.write);

			_encode(buffer, data);

			return buffer.toString();

		},

		decode: function(data) {

			var buffer = new _Buffer(data, _Buffer.MODE.read);

			var value = _decode(buffer);
			if (value === undefined) {
				return null;
			} else {
				return value;
			}

		}

	};


	return Module;

});

