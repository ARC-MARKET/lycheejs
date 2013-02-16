
lychee.define('Renderer').tags({
	platform: 'nodejs'
}).supports(function(lychee, global) {

	if (
		typeof process !== 'undefined'
		&& process.stdout
	) {
		return true
	}


	return false;

}).exports(function(lychee, global) {

	var Class = function(id) {

		id = typeof id === 'string' ? id : null;

		this.__id = id;

		this.__environment = {
			width: null,
			height: null,
			screen: {},
			offset: {}
		};

		this.__state = null;
		this.__width = 0;
		this.__height = 0;

		// required for requestAnimationFrame
		this.context = null;

	};

	Class.prototype = {

		/*
		 * State and Environment Management
		 */

		reset: function(width, height, resetCache) {

			width = typeof width === 'number' ? width : this.__width;
			height = typeof height === 'number' ? height : this.__height;
			resetCache = resetCache === true ? true : false;

			this.__width = width;
			this.__height = height;

			this.__updateEnvironment();

		},

		start: function() {
			if (this.__state !== 'running') {
				this.__state = 'running';
			}
		},

		stop: function() {
			this.__state = 'stopped';
		},

		clear: function() {},

		flush: function() {},

		isRunning: function() {
			return this.__state === 'running';
		},

		getEnvironment: function() {
			this.__updateEnvironment();
			return this.__environment;
		},



		/*
		 * PRIVATE API: Helpers
		 */

		__updateEnvironment: function() {

			this.__environment.screen.width  = 0;
			this.__environment.screen.height = 0;

			this.__environment.offset.x = 0;
			this.__environment.offset.y = 0;

			this.__environment.width  = this.__width;
			this.__environment.height = this.__height;

		},



		/*
		 * Setters
		 */

		setAlpha: function(alpha) {},

		setBackground: function(color) {},



		/*
		 * Drawing API
		 */

		drawBox: function(x1, y1, x2, y2, color, background, lineWidth) {},

		drawCircle: function(x, y, radius, color, background, lineWidth) {},

		drawLine: function(x1, y1, x2, y2, color, lineWidth) {},

		// points, x1, y1, [ ... x(a), y(a) ... ], [ color, background, lineWidth ]
		drawPolygon: function(points, x1, y1) {},

		drawSprite: function(x1, y1, sprite, map) {},

		drawText: function(x1, y1, text, font, center) {},

		drawTriangle: function(x1, y1, x2, y2, x3, y3, color, background, lineWidth) {}

	};


	return Class;

});

