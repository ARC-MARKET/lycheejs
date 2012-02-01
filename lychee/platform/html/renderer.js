
ly.renderer = function(view, debug) {

	if (!view instanceof ly.view) {
		throw 'Need a View instance to work properly';
	}


	this._view = view;
	this.debug = debug || null;

	this.__state = null;

	// TODO: Does it makes sense to have an initial reset?
	// Maybe dependend on the view?
	// this.reset();

};


ly.renderer.prototype = {

	/*
	 * PUBLIC API
	 */
	start: function() {
		if (this.__state !== 'running') {
			this.__state = 'running';
		}
	},

	stop: function() {
		this.__state = 'stopped';
	},

	isRunning: function() {
		return this.__state === 'running';
	},

	reset: function(width, height, resetCache) {

		if (resetCache === true) {
			this.__cache = {};
		}

		var viewport = this._view.get('viewport');

		this.__canvas = document.createElement('canvas');
		this.__ctx = this.__canvas.getContext('2d');

		this.__canvas.width = width;
		this.__canvas.height = height;

		this._view.setContext(this.__canvas);

		// required for requestAnimationFrame
		this.context = this.__canvas;

	},

	clear: function() {

		if (this.__state !== 'running') return;

		this.__ctx.clearRect(0, 0, this.__canvas.width, this.__canvas.height);

	},

	drawBox: function(x1, y1, x2, y2, color) {

		color = typeof color === 'string' ? color : '#000';

		throw 'Not implemented yet';

	},

	drawSprite: function(sprite, x, y, index) {

		sprite = Object.prototype.toString.call(sprite) === '[object Object]' ? sprite : null;
		index = typeof index === 'number' ? index : 0;

		if (sprite === null) return;

		this.__ctx.drawImage(
			sprite[index],
			x,
			y
		);

	},

	drawText: function(text, x, y, spriteOrFont, color) {

		// TODO: bitmap rendering
		if (Object.prototype.toString.call(spriteOrFont) === '[object Object]') {

			var map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

			throw 'Not implemented yet';

		// text rendering
		} else {
			this.__ctx.font = spriteOrFont || '20px Arial';
			this.__ctx.fillStyle = color;
			this.__ctx.fillText(text, x, y);
		}

	}

};

