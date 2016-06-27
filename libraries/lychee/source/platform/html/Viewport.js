
lychee.define('Viewport').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof global.addEventListener === 'function') {

		if (typeof global.innerWidth === 'number' && typeof global.innerHeight === 'number') {

			if (typeof global.document !== 'undefined' && typeof global.document.getElementsByClassName === 'function') {
				return true;
			}

		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	/*
	 * EVENTS
	 */

	var _clock = {
		orientationchange: null,
		resize:            0
	};

	var _focusactive   = true;
	var _reshapeactive = false;
	var _reshapewidth  = global.innerWidth;
	var _reshapeheight = global.innerHeight;

	var _reshape_viewport = function() {

		if (_reshapeactive === true || (_reshapewidth === global.innerWidth && _reshapeheight === global.innerHeight)) {
			return false;
		}


		_reshapeactive = true;



		/*
		 * ISSUE in Mobile WebKit:
		 *
		 * An issue occurs if width of viewport is higher than
		 * the width of the viewport of future rotation state.
		 *
		 * This bugfix prevents the viewport to scale higher
		 * than 1.0, even if the meta tag is correctly setup.
		 */

		var elements = global.document.getElementsByClassName('lychee-Renderer');
		for (var e = 0, el = elements.length; e < el; e++) {

			var element = elements[e];

			element.style.width  = '1px';
			element.style.height = '1px';

		}



		/*
		 * ISSUE in Mobile Firefox and Mobile WebKit
		 *
		 * The reflow is too slow for an update, so we have
		 * to lock the heuristic to only be executed once,
		 * waiting for a second to let the reflow finish.
		 */

		setTimeout(function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_reshape.call(_instances[i], global.innerWidth, global.innerHeight);
			}

			_reshapewidth  = global.innerWidth;
			_reshapeheight = global.innerHeight;
			_reshapeactive = false;

		}, 1000);

	};


	var _instances = [];
	var _listeners = {

		orientationchange: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_orientation.call(_instances[i], global.orientation);
			}

			_clock.orientationchange = Date.now();
			_reshape_viewport();

		},

		resize: function() {

			if (_clock.orientationchange === null || (_clock.orientationchange !== null && _clock.orientationchange > _clock.resize)) {

				_clock.resize = Date.now();
				_reshape_viewport();

			}

		},

		focus: function() {

			if (_focusactive === false) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_process_show.call(_instances[i]);
				}

				_focusactive = true;

			}

		},

		blur: function() {

			if (_focusactive === true) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_process_hide.call(_instances[i]);
				}

				_focusactive = false;

			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	var _enterFullscreen = null;
	var _leaveFullscreen = null;

	(function() {

		var resize      = 'onresize' in global;
		var orientation = 'onorientationchange' in global;
		var focus       = 'onfocus' in global;
		var blur        = 'onblur' in global;


		if (typeof global.addEventListener === 'function') {

			if (resize)      global.addEventListener('resize',            _listeners.resize,            true);
			if (orientation) global.addEventListener('orientationchange', _listeners.orientationchange, true);
			if (focus)       global.addEventListener('focus',             _listeners.focus,             true);
			if (blur)        global.addEventListener('blur',              _listeners.blur,              true);

		}


		if (global.document && global.document.documentElement) {

			var element = global.document.documentElement;

			if (typeof element.requestFullscreen === 'function' && typeof element.exitFullscreen === 'function') {

				_enterFullscreen = function() {
					element.requestFullscreen();
				};

				_leaveFullscreen = function() {
					element.exitFullscreen();
				};

			}


			if (_enterFullscreen === null || _leaveFullscreen === null) {

				var prefixes = [ 'moz', 'ms', 'webkit' ];
				var prefix   = null;

				for (var p = 0, pl = prefixes.length; p < pl; p++) {

					if (typeof element[prefixes[p] + 'RequestFullScreen'] === 'function' && typeof document[prefixes[p] + 'CancelFullScreen'] === 'function') {
						prefix = prefixes[p];
						break;
					}

				}


				if (prefix !== null) {

					_enterFullscreen = function() {
						element[prefix + 'RequestFullScreen']();
					};

					_leaveFullscreen = function() {
						global.document[prefix + 'CancelFullScreen']();
					};

				}

			}

		}


		if (lychee.debug === true) {

			var methods = [];

			if (resize)      methods.push('Resize');
			if (orientation) methods.push('Orientation');
			if (focus)       methods.push('Focus');
			if (blur)        methods.push('Blur');

			if (_enterFullscreen !== null && _leaveFullscreen !== null) {
				methods.push('Fullscreen');
			}

			if (methods.length === 0) {
				console.error('lychee.Viewport: Supported methods are NONE');
			} else {
				console.info('lychee.Viewport: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * HELPERS
	 */

	var _process_show = function() {

		return this.trigger('show');

	};

	var _process_hide = function() {

		return this.trigger('hide');

	};

	var _process_orientation = function(orientation) {

		orientation = typeof orientation === 'number' ? orientation : null;

		if (orientation !== null) {
			this.__orientation = orientation;
		}

	};

	var _process_reshape = function(width, height) {

		if (width === this.width && height === this.height) {
			return false;
		}


		this.width  = width;
		this.height = height;



		var orientation = null;
		var rotation    = null;



		/*
		 *    TOP
		 *  _______
		 * |       |
		 * |       |
		 * |       |
		 * |       |
		 * |       |
		 * [X][X][X]
		 *
		 *  BOTTOM
		 */

		if (this.__orientation === 0) {

			if (width > height) {

				orientation = 'landscape';
				rotation    = 'landscape';

			} else {

				orientation = 'portrait';
				rotation    = 'portrait';

			}



		/*
		 *  BOTTOM
		 *
		 * [X][X][X]
		 * |       |
		 * |       |
		 * |       |
		 * |       |
		 * |_______|
		 *
		 *    TOP
		 */

		} else if (this.__orientation === 180) {

			if (width > height) {

				orientation = 'landscape';
				rotation    = 'landscape';

			} else {

				orientation = 'portrait';
				rotation    = 'portrait';

			}



		/*
		 *    ____________    B
		 * T |            [x] O
		 * O |            [x] T
		 * P |____________[x] T
		 *                    O
		 *                    M
		 */

		} else if (this.__orientation === 90) {

			if (width > height) {

				orientation = 'portrait';
				rotation    = 'landscape';

			} else {

 				orientation = 'landscape';
				rotation    = 'portrait';

			}



		/*
		 * B    ____________
		 * O [x]            | T
		 * T [x]            | O
		 * T [x]____________| P
		 * O
		 * M
		 */

		} else if (this.__orientation === -90) {

			if (width > height) {

				orientation = 'portrait';
				rotation    = 'landscape';

			} else {

 				orientation = 'landscape';
				rotation    = 'portrait';

			}

		}


		return this.trigger('reshape', [ orientation, rotation, width, height ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.fullscreen = false;
		this.width      = global.innerWidth;
		this.height     = global.innerHeight;

		this.__orientation = typeof global.orientation === 'number' ? global.orientation : 0;


		lychee.event.Emitter.call(this);

		_instances.push(this);


		this.setFullscreen(settings.fullscreen);



		/*
		 * INITIALIZATION
		 */

		setTimeout(function() {

			this.width  = 0;
			this.height = 0;

			_process_reshape.call(this, global.innerWidth, global.innerHeight);

		}.bind(this), 100);


		settings = null;

	};


	Class.prototype = {

		destroy: function() {

			var found = false;

			for (var i = 0, il = _instances.length; i < il; i++) {

				if (_instances[i] === this) {
					_instances.splice(i, 1);
					found = true;
					il--;
					i--;
				}

			}

			this.unbind();


			return found;

		},



		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.Viewport';

			var settings = {};


			if (this.fullscreen !== false) settings.fullscreen = this.fullscreen;


			data['arguments'][0] = settings;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setFullscreen: function(fullscreen) {

			if (fullscreen === true && this.fullscreen === false) {

				if (_enterFullscreen !== null) {

					_enterFullscreen();
					this.fullscreen = true;

					return true;

				}

			} else if (fullscreen === false && this.fullscreen === true) {

				if (_leaveFullscreen !== null) {

					_leaveFullscreen();
					this.fullscreen = false;

					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

