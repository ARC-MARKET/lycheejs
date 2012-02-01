
ly.renderer = function(debug) {

	this.debug = debug || null;

	this.__state = null;

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


		this.__canvas = document.createElement('canvas');
		this.__ctx = this.__canvas.getContext('2d');

		this.__canvas.width = width;
		this.__canvas.height = height;

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

		if (sprite instanceof Image) {
			index = null;
		} else if (Object.prototype.toString.call(sprite) === '[object Object]') {
			index = typeof index === 'number' ? index : null;
		}


		if (index === null) {
			this.__ctx.drawImage(sprite, x, y);
		} else {
			this.__ctx.drawImage(sprite[index], x, y);
		}

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

