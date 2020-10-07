
lychee.define('studio.codec.FONT').tags({
	platform: 'html'
}).supports((lychee, global) => {

	/*
	 * XXX: typeof CanvasRenderingContext2D is:
	 * > function in Chrome, Firefox, IE10
	 * > object in Safari, Safari Mobile
	 */

	if (
		typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
		&& typeof global.CanvasRenderingContext2D !== 'undefined'
	) {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	let _CANVAS  = null;
	let _CONTEXT = null;
	let _FONT_ID = 0;


	(function() {

		let doc = global.document || null;
		if (doc !== null) {

			let canvas = doc.createElement('canvas');
			if (canvas !== null) {

				canvas.style.webkitFontSmoothing = 'subpixel-antialiased';
				canvas.style.fontSmoothing       = 'subpixel-antialiased';

				let context = canvas.getContext('2d');
				if (context !== null) {
					_CANVAS  = canvas;
					_CONTEXT = context;
				}

			}

		}

	})();



	/*
	 * HELPERS
	 */

	const _measure_baseline = function(settings, measurements) {

		let baselines = [];
		let data      = _CONTEXT.getImageData(0, 0, _CANVAS.width, _CANVAS.height);


		for (let x = 0; x < data.width; x++) {

			let baseline = data.height / 2;

			for (let y = Math.abs(data.height / 2); y >= 0; y--) {

				let pixel = y * data.width * 4 + x * 4;
				let col_r = data.data[pixel + 0];
				let col_g = data.data[pixel + 1];
				let col_b = data.data[pixel + 2];

				if (col_r > 0 && col_g > 0 && col_b > 0) {

					baseline = y;

					if (baselines.indexOf(baseline) === -1) {
						baselines.push(baseline);
					}

				}

			}

		}


		baselines.sort((a, b) => {
			if (a < b) return -1;
			if (a > b) return  1;
			return 0;
		});


		if (baselines.length > 0) {
			measurements.baseline = baselines[0];
		} else {
			measurements.baseline = 0;
		}

	};

	const _measure_margin = function(settings, measurements) {

		let data     = _CONTEXT.getImageData(0, 0, _CANVAS.width, _CANVAS.height);
		let margin_t = measurements.height;
		let margin_b = 0;


		for (let d = 0, dl = data.data.length; d < dl; d++) {

			let y = ((d / 4) / data.width) | 0;

			if (y < margin_t && data.data[d + 3] > 0) {
				margin_t = y;
			}

			if (y > margin_b && data.data[d + 3] > 0) {
				margin_b = y;
			}

		}


		measurements.margin_b = (measurements.height - margin_b);
		measurements.margin_t = margin_t;

	};

	const _render_outline = function(settings, measurements) {

		let tmp    = settings.font;
		let offset = measurements.offset;


		_CONTEXT.font         = tmp.style + ' ' + tmp.size + 'px "' + tmp.family + '"';
		_CONTEXT.textBaseline = 'top';
		_CONTEXT.fillStyle    = '#000000';


		let outline = tmp.outline;
		let margin  = settings.spacing;

		for (let c = 0; c < settings.charset.length; c++) {

			for (let x = -1 * outline; x <= outline; x += 2) {

				for (let y = -1 * outline; y <= outline; y += 2) {

					_CONTEXT.fillText(
						settings.charset[c],
						margin + x,
						offset + y
					);

				}

			}

			margin += measurements.map[c] + settings.spacing * 2;

		}

	};

	const _render_text = function(settings, measurements) {

		let tmp    = settings.font;
		let offset = measurements.offset;

		_CONTEXT.font         = tmp.style + ' ' + tmp.size + 'px "' + tmp.family + '"';
		_CONTEXT.textBaseline = 'top';
		_CONTEXT.fillStyle    = tmp.color;


		let margin = settings.spacing;

		for (let c = 0; c < settings.charset.length; c++) {

			_CONTEXT.fillText(
				settings.charset[c],
				margin,
				offset
			);

			margin += measurements.map[c] + settings.spacing * 2;

		}

	};



	/*
	 * ENCODER and DECODER
	 */

	const _encode = function(font, data) {

		let measurements = {
			width:    0,
			height:   0,
			offset:   0,
			margin_b: 0,
			margin_t: 0,
			map:      []
		};
		let settings     = Object.assign({}, {
			baseline:   font.baseline,
			charset:    font.charset,
			kerning:    font.kerning,
			spacing:    font.spacing,
			lineheight: font.lineheight
		}, data);
		let tmp          = settings.font;



		/*
		 * Generate Measurements
		 */

		measurements.width  = settings.spacing;
		measurements.height = tmp.size * 3 + tmp.outline * 2;

		_CONTEXT.font         = tmp.style + ' ' + tmp.size + 'px "' + tmp.family + '"';
		_CONTEXT.textBaseline = 'top';

		for (let c = 0, cl = settings.charset.length; c < cl; c++) {

			let m = _CONTEXT.measureText(settings.charset[c]);
			let w = Math.max(1, Math.ceil(m.width)) + tmp.outline * 2;

			measurements.width += w + settings.spacing * 2;
			measurements.map.push(w);

		}

		_CANVAS.width        = measurements.width;
		_CANVAS.height       = measurements.height;
		_CANVAS.style.width  = measurements.width  + 'px';
		_CANVAS.style.height = measurements.height + 'px';



		// Render Font and Outline

		measurements.offset = tmp.size + tmp.outline;
		if (tmp.outline > 0) _render_outline(settings, measurements);
		_render_text(settings, measurements);



		// Measure Margins and Baseline

		_measure_margin(settings, measurements);

		if (measurements.margin_t > 0 || measurements.margin_b > 0) {

			// Apply new dimensions

			measurements.height  = measurements.height - measurements.margin_t - measurements.margin_b;
			measurements.height += 2; // XXX: 1px space for antialiasing
			_CANVAS.height       = 0;
			_CANVAS.height       = measurements.height;
			_CANVAS.style.height = measurements.height + 'px';
			measurements.offset  = tmp.size + tmp.outline - measurements.margin_t;
			measurements.offset += 1; // XXX: 1px space for antialiasing


			// Render Font and Outline again

			if (tmp.outline > 0) _render_outline(settings, measurements);
			_render_text(settings, measurements);

		}

		_measure_baseline(settings, measurements);


		let blob    = _CANVAS.toDataURL('image/png');
		let texture = new Texture(blob);

		texture.deserialize({ buffer: blob });


		// Export Settings

		font.baseline   = measurements.baseline;
		font.charset    = settings.charset;
		font.kerning    = settings.kerning;
		font.lineheight = measurements.height;
		font.spacing    = settings.spacing;
		font.texture    = texture;
		font.__font     = {
			color:   tmp.color,
			family:  tmp.family,
			outline: tmp.outline,
			size:    tmp.size,
			style:   tmp.style
		};

		font.__buffer   = {
			texture:    blob,
			map:        measurements.map,
			baseline:   font.baseline,
			charset:    font.charset,
			lineheight: font.lineheight,
			kerning:    font.kerning,
			spacing:    font.spacing,
			font:       font.__font
		};

	};

	const _decode = function(font, settings) {

		let tmp = font.__font;


		settings.baseline   = font.baseline;
		settings.charset    = font.charset;
		settings.kerning    = font.kerning;
		settings.lineheight = font.lineheight;
		settings.spacing    = font.spacing;
		settings.texture    = font.texture;


		settings.font = {
			color:   tmp.color   || '#ffffff',
			family:  tmp.family  || 'Ubuntu Mono',
			outline: tmp.outline || 0,
			size:    tmp.size    || 16,
			style:   tmp.style   || 'normal'
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'studio.codec.FONT',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let id   = _FONT_ID++;
				let font = new Font('/tmp/Font-' + id + '.fnt');

				_encode(font, data);

				return font;

			}


			return null;

		},

		decode: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				let object = {};

				_decode(font, object);

				return object;

			}


			return null;

		}

	};


	return Module;

});

