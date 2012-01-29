
editor.canvas = function(settings) {

	this.settings = {};
	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}

	this.__init();

};



editor.canvas.prototype = {

	defaults: {
		context: '#editor-canvas',
		size: {
			x: 10,
			y: 10,
			tile: 42
		},
		depth: 0.5, // tilesize * 1 / depth
		invertedX: false,
		invertedY: true,
		invertedZ: false, // higher = closer to user
		grid: true
	},



	/*
	 * PUBLIC API
	 */
	reset: function() {

		this.__layers = {};

		// temporary high priorized event layer
		this.__once = null;

	},

	addLayer: function(name, type, zIndex) {

		if (this.__layers[name] !== undefined) {
			throw 'Layer ' + name + ' is already added to canvas.';
		}

		this.__layers[name] = new editor.canvas.layer(name, type, zIndex);

		var that = this;
		this.__layers[name].once = function(func, scope) {
			that.once(this.name, func, scope);
		};

		this.__context.appendChild(this.__layers[name].element);
		this.refresh();

		return this.__layers[name];

	},

	hideLayer: function(name) {

		if (this.__layers[name] !== undefined) {
			this.__layers[name].hide();
		}

	},

	/*
	 * Note: This is a 2.5D z-layered canvas
	 */
	getZLayer: function(name) {
		return this.__shift.z || 0;
	},

	/*
	 * This is actually a wrapper for Layer's
	 * high priorized event functionality
	 */
	once: function(name, func, scope) {

		if (this.__layers[name] !== undefined) {
			this.__once = {
				layer: this.__layers[name],
				func: func || function() {},
				scope: scope || window
			};
		} else {
			this.__once = null;
		}

	},

	refresh: function() {

		var size = this.settings.size;

		this.__context.style.width = size.x * size.tile + 'px';
		this.__context.style.height = size.y * size.tile + 'px';

		this.__pxCenter = {
			x: (size.x * size.tile / 2),
			y: (size.y * size.tile / 2)
		};


		for (var lId in this.__layers) {

			var layer = this.__layers[lId];
			if (layer.type === 'canvas') {
				layer.element.width = size.x * size.tile;
				layer.element.height = size.y * size.tile;
			}

			(function(layer) {
				window.setTimeout(function() {
					layer.trigger('refresh');
				}, 0);
			})(layer);

		}

		this.__refreshOffset();
		this.__refreshLayer();

	},

	shift: function(margin) {

		margin = margin || {};
		margin.x = typeof margin.x === 'number' ? margin.x : 0;
		margin.y = typeof margin.y === 'number' ? margin.y : 0;
		margin.z = typeof margin.z === 'number' ? margin.z : 0;

		if (this.settings.invertedX === true) {
			margin.x *= -1;
		}

		if (this.settings.invertedY === true) {
			margin.y *= -1;
		}

		if (this.settings.invertedZ === true) {
			margin.z *= -1;
		}

		this.__shift.x += margin.x;
		this.__shift.y += margin.y;
		this.__shift.z += margin.z;

		this.refresh();

	},

	shiftTo: function(position) {

		position = position || {};
		position.x = typeof position.x === 'number' ? position.x : this.__shift.x;
		position.y = typeof position.y === 'number' ? position.y : this.__shift.y;
		position.z = typeof position.z === 'number' ? position.z : this.__shift.z;

		this.__shift.x = position.x;
		this.__shift.y = position.y;
		this.__shift.z = position.z;

		this.refresh();

	},

	translateTo: function(to, data, fromPixel, toPixel) {

		fromPixel = fromPixel === true ? true : false;
		toPixel = toPixel === true ? true : false;

		var size = this.settings.size,
			center = this.__pxCenter,
			shift = {
				x: this.__shift.x,
				y: this.__shift.y
			},
			translated = {};

		translated.tile = size.tile;
		translated.x = data.x;
		translated.y = data.y;

		if (fromPixel === false) {
			translated.x *= size.tile;
			translated.y *= size.tile;
		}

		if (to === 'relative') {

			translated.x -= center.x;
			translated.y -= center.y;

			translated.x -= shift.x * size.tile;
			translated.y -= shift.y * size.tile;

			if (this.settings.invertedX === true) {
				translated.x *= -1;
			}

			if (this.settings.invertedY === true) {
				translated.y *= -1;
			}

		} else if (to === 'absolute') {

			if (this.settings.invertedX === true) {
				translated.x *= -1;
			}

			if (this.settings.invertedY === true) {
				translated.y *= -1;
			}

			translated.x += center.x;
			translated.y += center.y;

			translated.x += shift.x * size.tile;
			translated.y += shift.y * size.tile;

		}


		if (toPixel === false) {
			translated.x /= size.tile;
			translated.y /= size.tile;
		}

		return translated;

	},



	/*
	 * PRIVATE API
	 */
	__init: function() {

		this.reset();

		this.__context = document.querySelector(this.settings.context);

		this.__layer = new editor.canvas.layer('canvas', 'canvas', 0);
		this.__ctx = this.__layer.element.getContext('2d');
		this.__context.appendChild(this.__layer.element);

		this.__shift = { x: 0, y: 0, z: 0 };

		this.__initEvents();
		this.refresh();

	},

	__initEvents: function() {

		var that = this;
		this.__context.addEventListener('mousedown', function(event) {
			that.__trigger('down', event);
		});

		this.__context.addEventListener('mousemove', function(event) {
			that.__trigger('move', event);
		});

		this.__context.addEventListener('mouseup', function(event) {
			that.__trigger('up', event);
		});

	},

	__refreshLayer: function() {

		if (this.__layer === undefined || this.__ctx === undefined) {
			return;
		}

		var size = this.settings.size,
			width = size.x * size.tile,
			height = size.y * size.tile;

		this.__layer.element.width = width;
		this.__layer.element.height = height;


		var center = this.__pxCenter,
			shift = this.__shift,
			ctx = this.__ctx,
			abs;

		ctx.clearRect(0, 0, width, height);


		if (this.settings.grid === true) {

			var fontSize = 12;
			ctx.font = '12px Helvetica';
			ctx.fillStyle = '#000';
			ctx.strokeStyle = '#ddd';
			ctx.strokeWidth = 1;


			var halfTileWidth = size.x / 2,
				halfTileHeight = size.y / 2,
				minX = Math.floor(0 - halfTileWidth),
				maxX = Math.round(0 + halfTileWidth),
				minY = Math.floor(0 - halfTileHeight),
				maxY = Math.round(0 + halfTileHeight);

			if (this.settings.invertedX === true) {
				minX += shift.x;
				maxX += shift.x;
			} else {
				minX -= shift.x;
				maxX -= shift.x;
			}

			if (this.settings.invertedY === true) {
				minY += shift.y;
				maxY += shift.y;
			} else {
				minY -= shift.y;
				maxY -= shift.y;
			}


			for (var x = minX; x <= maxX; x++) {

				abs = this.translateTo('absolute', { x: x }, false, true);

				ctx.beginPath();
				ctx.moveTo(abs.x, 0);
				ctx.lineTo(abs.x, height);
				ctx.stroke();
				ctx.fillText(x, abs.x - 4, fontSize);
				ctx.closePath();

			}

			for (var y = minY; y <= maxY; y++) {

				abs = this.translateTo('absolute', { y: y }, false, true);

				ctx.beginPath();
				ctx.moveTo(0, abs.y);
				ctx.lineTo(width, abs.y);
				ctx.stroke();
				ctx.fillText(y, 0, abs.y + 4);
				ctx.closePath();

			}

		}


		abs.x = center.x + shift.x * size.tile;
		abs.y = center.y + shift.y * size.tile;

		ctx.strokeStyle = '#000';
		ctx.strokeWidth = 2;

		ctx.beginPath();
		ctx.moveTo(0, abs.y);
		ctx.lineTo(width, abs.y);
		ctx.moveTo(abs.x, 0);
		ctx.lineTo(abs.x, height);
		ctx.closePath();
		ctx.stroke();

	},

	__refreshOffset: function() {

		var node = this.__context,
			offset = {
				x: this.__context.offsetLeft,
				y: this.__context.offsetTop
			};

		while (node.parentNode !== document.body) {
			node = node.parentNode;
			offset.x += node.offsetLeft;
			offset.y += node.offsetTop;
		}

		this.__offset = offset;

	},

	__trigger: function(name, event) {

		var offset = this.__offset,
			depth = this.settings.depth,
			shift = this.__shift,
			size = this.settings.size;

		var absolute = {
			tile: size.tile,
			x: Math.round(event.clientX - offset.x),
			y: Math.round(event.clientY - offset.y)
		};

		absolute.x /= size.tile;
		absolute.x /= depth;

		absolute.y /= size.tile;
		absolute.y /= depth;

		absolute.x = Math.round(absolute.x);
		absolute.y = Math.round(absolute.y);

		absolute.x *= depth;
		absolute.y *= depth;

		absolute.x += (shift.x % depth);
		absolute.y += (shift.y % depth);


		var relative = this.translateTo('relative', absolute);

		// 2.5D z-layered
		relative.z = this.getZLayer();


		// High priorized event chain
		if (this.__once !== null) {

			var data = this.__once;
			data.name = name;
			data.layer.triggerOnce(data, relative, absolute);

		// Low priorized events
		} else {

			for (var lId in this.__layers) {
				var layer = this.__layers[lId];

				// Layer's state is modified by Plugin.onActivate() and onDeactivate()
				if (layer.active === true) {
					layer.trigger(name, relative, absolute);
				}
			}

		}

		// Reset high priorized event chain on end
		if (name === 'up') {
			this.__once = null;
		}

		// This will overwrite default behaviour (dragging)
		event.preventDefault();
		event.stopPropagation();

	}

};

