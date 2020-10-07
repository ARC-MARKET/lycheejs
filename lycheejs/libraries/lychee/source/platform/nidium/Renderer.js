
lychee.define('lychee.Renderer').tags({
	platform: 'nidium'
}).supports((lychee, global) => {

	if (
		typeof global.Canvas === 'function'
		&& typeof global.document === 'object'
		&& typeof global.document.canvas === 'object'
		&& typeof global.window === 'object'
	) {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	let _window = null;
	let _canvas = null;
	let _Canvas = null;
	const _PI2  = Math.PI * 2;
	let   _id   = 0;



	/*
	 * FEATURE DETECTION
	 */

	(function(global) {

		if (typeof global.window === 'object') {
			_window = global.window;
		}

		if (typeof global.document !== 'undefined') {

			if (typeof global.document.canvas !== 'undefined') {
				_canvas = global.document.canvas;
			}

		}

		if (typeof global.Canvas === 'function') {
			_Canvas = global.Canvas;
		}

	})(global);



	/*
	 * HELPERS
	 */

	const _Buffer = function(width, height) {

		this.width  = typeof width === 'number'  ? width  : 1;
		this.height = typeof height === 'number' ? height : 1;

		this.__buffer = new _Canvas(this.width, this.height);
		this.__ctx    = this.__buffer.getContext('2d');


		this.resize(this.width, this.height);

	};

	_Buffer.prototype = {

		clear: function() {

			this.__ctx.clearRect(0, 0, this.width, this.height);

		},

		resize: function(width, height) {

			this.width  = width;
			this.height = height;

			this.__buffer.width  = this.width;
			this.__buffer.height = this.height;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.alpha      = 1.0;
		this.background = '#000000';
		this.id         = 'lychee-Renderer-' + _id++;
		this.width      = null;
		this.height     = null;
		this.offset     = { x: 0, y: 0 };

		this.__canvas = new _Canvas(512, 512);
		this.__ctx    = this.__canvas.getContext('2d');

		if (_canvas !== null) {
			_canvas.add(this.__canvas);
		}


		this.setAlpha(states.alpha);
		this.setBackground(states.background);
		this.setId(states.id);
		this.setWidth(states.width);
		this.setHeight(states.height);


		states = null;

	};


	Composite.prototype = {

		destroy: function() {

			if (_canvas !== null) {
				_canvas.remove(this.__canvas);
			}


			return true;

		},



		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.alpha !== 1.0)                               states.alpha      = this.alpha;
			if (this.background !== '#000000')                    states.background = this.background;
			if (this.id.startsWith('lychee-Renderer-') === false) states.id         = this.id;
			if (this.width !== null)                              states.width      = this.width;
			if (this.height !== null)                             states.height     = this.height;


			return {
				'constructor': 'lychee.Renderer',
				'arguments':   [ states ],
				'blob':        null
			};

		},



		/*
		 * SETTERS AND GETTERS
		 */

		setAlpha: function(alpha) {

			alpha = typeof alpha === 'number' ? alpha : null;


			if (alpha !== null) {

				if (alpha >= 0 && alpha <= 1) {

					this.alpha = alpha;

					return true;

				}

			}


			return false;

		},

		setBackground: function(color) {

			color = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : null;


			if (color !== null) {

				this.background = color;

				return true;

			}


			return false;

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.id = id;
				this.__canvas.id = id;

				return true;

			}


			return false;

		},

		setWidth: function(width) {

			width = typeof width === 'number' ? width : null;


			if (width !== null) {
				this.width = width | 0;
			} else {
				this.width = _window.innerWidth | 0;
			}


			this.__canvas.setSize(this.width, this.height);
			this.offset.x = this.__canvas.left;


			return true;

		},

		setHeight: function(height) {

			height = typeof height === 'number' ? height : null;


			if (height !== null) {
				this.height = height | 0;
			} else {
				this.height = _window.innerHeight | 0;
			}


			this.__canvas.setSize(this.width, this.height);
			this.offset.y = this.__canvas.top;


			return true;

		},



		/*
		 * BUFFER INTEGRATION
		 */

		clear: function(buffer) {

			buffer = buffer instanceof _Buffer ? buffer : null;


			if (buffer !== null) {

				buffer.clear();

			} else {

				let ctx = this.__ctx;

				ctx.fillStyle = this.background;
				ctx.fillRect(0, 0, this.width, this.height);

			}


			return true;

		},

		flush: function() {

			return true;

		},

		createBuffer: function(width, height) {

			width  = typeof width === 'number'  ? width  : 1;
			height = typeof height === 'number' ? height : 1;


			return new _Buffer(width, height);

		},

		setBuffer: function(buffer) {

			buffer = buffer instanceof _Buffer ? buffer : null;


			if (buffer !== null) {
				this.__ctx = buffer.__ctx;
			} else {
				this.__ctx = this.__canvas.getContext('2d');
			}


			return true;

		},



		/*
		 * DRAWING API
		 */

		drawArc: function(x, y, start, end, radius, color, background, lineWidth) {

			x          = x | 0;
			y          = y | 0;
			start      = typeof start === 'number'              ? start     : 0;
			end        = typeof end === 'number'                ? end       : 2;
			radius     = radius | 0;
			color      = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color     : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number'          ? lineWidth : 1;


			let ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();

			ctx.arc(
				x,
				y,
				radius,
				start * _PI2,
				end   * _PI2
			);

			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = color;
				ctx.stroke();
			} else {
				ctx.fillStyle   = color;
				ctx.fill();
			}

			ctx.closePath();


			return true;

		},

		drawBox: function(x1, y1, x2, y2, color, background, lineWidth) {

			x1         = x1 | 0;
			y1         = y1 | 0;
			x2         = x2 | 0;
			y2         = y2 | 0;
			color      = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			let ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;

			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = color;
				ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
			} else {
				ctx.fillStyle   = color;
				ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
			}


			return true;

		},

		drawBuffer: function(x1, y1, buffer, map) {

			x1     = x1 | 0;
			y1     = y1 | 0;
			buffer = buffer instanceof _Buffer ? buffer : null;
			map    = map instanceof Object     ? map    : null;


			if (buffer !== null) {

				let ctx    = this.__ctx;
				let width  = 0;
				let height = 0;
				let x      = 0;
				let y      = 0;
				let r      = 0;


				ctx.globalAlpha = this.alpha;

				if (map === null) {

					width  = buffer.width;
					height = buffer.height;

					ctx.drawImage(
						buffer.__buffer,
						x,
						y,
						width,
						height,
						x1,
						y1,
						width,
						height
					);

				} else {

					width  = map.w;
					height = map.h;
					x      = map.x;
					y      = map.y;
					r      = map.r || 0;

					if (r === 0) {

						ctx.drawImage(
							buffer.__buffer,
							x,
							y,
							width,
							height,
							x1,
							y1,
							width,
							height
						);

					} else {

						let cos = Math.cos(r * Math.PI / 180);
						let sin = Math.sin(r * Math.PI / 180);

						ctx.setTransform(
							cos,
							sin,
							-sin,
							cos,
							x1,
							y1
						);

						ctx.drawImage(
							buffer.__buffer,
							x,
							y,
							width,
							height,
							-1 / 2 * width,
							-1 / 2 * height,
							width,
							height
						);

						ctx.setTransform(
							1,
							0,
							0,
							1,
							0,
							0
						);

					}

				}

			}


			return true;

		},

		drawCircle: function(x, y, radius, color, background, lineWidth) {

			x          = x | 0;
			y          = y | 0;
			radius     = radius | 0;
			color      = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			let ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();

			ctx.arc(
				x,
				y,
				radius,
				0,
				_PI2
			);


			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = color;
				ctx.stroke();
			} else {
				ctx.fillStyle   = color;
				ctx.fill();
			}

			ctx.closePath();


			return true;

		},

		drawLine: function(x1, y1, x2, y2, color, lineWidth) {

			x1        = x1 | 0;
			y1        = y1 | 0;
			x2        = x2 | 0;
			y2        = y2 | 0;
			color     = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : '#000000';
			lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;


			let ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);

			ctx.lineWidth   = lineWidth;
			ctx.strokeStyle = color;
			ctx.stroke();

			ctx.closePath();


			return true;

		},

		drawTriangle: function(x1, y1, x2, y2, x3, y3, color, background, lineWidth) {

			x1         = x1 | 0;
			y1         = y1 | 0;
			x2         = x2 | 0;
			y2         = y2 | 0;
			x3         = x3 | 0;
			y3         = y3 | 0;
			color      = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : '#000000';
			background = background === true;
			lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


			let ctx = this.__ctx;


			ctx.globalAlpha = this.alpha;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x3, y3);
			ctx.lineTo(x1, y1);

			if (background === false) {
				ctx.lineWidth   = lineWidth;
				ctx.strokeStyle = color;
				ctx.stroke();
			} else {
				ctx.fillStyle   = color;
				ctx.fill();
			}

			ctx.closePath();


			return true;

		},

		// points, x1, y1, [ ... x(a), y(a) ... ], [ color, background, lineWidth ]
		drawPolygon: function(points, x1, y1) {

			points = typeof points === 'number' ? points : 0;
			x1     = x1 | 0;
			y1     = y1 | 0;


			let l = arguments.length;

			if (points > 3) {

				let optargs = l - (points * 2) - 1;
				let color, background, lineWidth;

				if (optargs === 3) {

					color      = arguments[l - 3];
					background = arguments[l - 2];
					lineWidth  = arguments[l - 1];

				} else if (optargs === 2) {

					color      = arguments[l - 2];
					background = arguments[l - 1];

				} else if (optargs === 1) {

					color      = arguments[l - 1];

				}


				color      = /(#[AaBbCcDdEeFf0-9]{6})/g.test(color) ? color : '#000000';
				background = background === true;
				lineWidth  = typeof lineWidth === 'number' ? lineWidth : 1;


				let ctx = this.__ctx;


				ctx.globalAlpha = this.alpha;
				ctx.beginPath();
				ctx.moveTo(x1, y1);

				for (let p = 1; p < points; p++) {

					ctx.lineTo(
						arguments[1 + p * 2]     | 0,
						arguments[1 + p * 2 + 1] | 0
					);

				}

				ctx.lineTo(x1, y1);

				if (background === false) {
					ctx.lineWidth   = lineWidth;
					ctx.strokeStyle = color;
					ctx.stroke();
				} else {
					ctx.fillStyle   = color;
					ctx.fill();
				}

				ctx.closePath();


				return true;

			}


			return false;

		},

		drawSprite: function(x1, y1, texture, map) {

			x1      = x1 | 0;
			y1      = y1 | 0;
			texture = texture instanceof Texture ? texture : null;
			map     = map instanceof Object      ? map     : null;


			if (texture !== null && texture.buffer !== null) {

				let ctx    = this.__ctx;
				let width  = 0;
				let height = 0;
				let x      = 0;
				let y      = 0;
				let r      = 0;


				ctx.globalAlpha = this.alpha;

				if (map === null) {

					width  = texture.width;
					height = texture.height;

					ctx.drawImage(
						texture.buffer,
						x,
						y,
						width,
						height,
						x1,
						y1,
						width,
						height
					);

				} else {

					width  = map.w;
					height = map.h;
					x      = map.x;
					y      = map.y;
					r      = map.r || 0;

					if (r === 0) {

						ctx.drawImage(
							texture.buffer,
							x,
							y,
							width,
							height,
							x1,
							y1,
							width,
							height
						);

					} else {

						let cos = Math.cos(r * Math.PI / 180);
						let sin = Math.sin(r * Math.PI / 180);

						ctx.setTransform(
							cos,
							sin,
							-sin,
							cos,
							x1,
							y1
						);

						ctx.drawImage(
							texture.buffer,
							x,
							y,
							width,
							height,
							-1 / 2 * width,
							-1 / 2 * height,
							width,
							height
						);

						ctx.setTransform(
							1,
							0,
							0,
							1,
							0,
							0
						);

					}

				}


				return true;

			}


			return false;

		},

		drawText: function(x1, y1, text, font, center) {

			x1     = x1 | 0;
			y1     = y1 | 0;
			text   = typeof text === 'string' ? text : null;
			font   = font instanceof Font     ? font : null;
			center = center === true;


			if (text !== null && font !== null) {

				if (center === true) {

					let dim = font.measure(text);

					x1 = (x1 - dim.realwidth / 2) | 0;
					y1 = (y1 - (dim.realheight - font.baseline) / 2) | 0;

				}


				y1 = (y1 - font.baseline / 2) | 0;


				let margin  = 0;
				let texture = font.texture;
				if (texture !== null && texture.buffer !== null) {

					let ctx = this.__ctx;


					ctx.globalAlpha = this.alpha;

					for (let t = 0, l = text.length; t < l; t++) {

						let chr = font.measure(text[t]);

						ctx.drawImage(
							texture.buffer,
							chr.x,
							chr.y,
							chr.width,
							chr.height,
							x1 + margin - font.spacing,
							y1,
							chr.width,
							chr.height
						);

						margin = margin + chr.realwidth + font.kerning;

					}


					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

