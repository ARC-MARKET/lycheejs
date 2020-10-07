
lychee.define('lychee.Viewport').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (
		typeof global.addEventListener === 'function'
		&& typeof global.innerWidth === 'number'
		&& typeof global.innerHeight === 'number'
		&& typeof global.document !== 'undefined'
		&& typeof global.document.querySelectorAll === 'function'
	) {

		return true;

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _Emitter   = lychee.import('lychee.event.Emitter');
	const _CLOCK     = {
		orientationchange: null,
		resize:            0
	};
	const _INSTANCES = [];



	/*
	 * EVENTS
	 */

	let _focusactive   = true;
	let _reshapeactive = false;
	let _reshapewidth  = global.innerWidth  | 0;
	let _reshapeheight = global.innerHeight | 0;

	const _reshape_viewport = function() {

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

		let elements = global.document.querySelectorAll('.lychee-Renderer');
		for (let e = 0, el = elements.length; e < el; e++) {

			let element = elements[e];

			element.style.width  = '1px';
			element.style.height = '1px';

		}



		/*
		 * ISSUE in Mobile Firefox and Mobile WebKit
		 *
		 * The reflow is too slow for an update, so we have
		 * to lock the heuristic to only be executed once,
		 * waiting for 500ms to let the reflow finish.
		 */

		setTimeout(_ => {

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				_process_reshape.call(_INSTANCES[i], global.innerWidth, global.innerHeight);
			}

			_reshapewidth  = global.innerWidth  | 0;
			_reshapeheight = global.innerHeight | 0;
			_reshapeactive = false;

		}, 500);

	};

	const _listeners = {

		orientationchange: function() {

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				_process_orientation.call(_INSTANCES[i], global.orientation);
			}

			_CLOCK.orientationchange = Date.now();
			_reshape_viewport();

		},

		resize: function() {

			if (_CLOCK.orientationchange === null || (_CLOCK.orientationchange !== null && _CLOCK.orientationchange > _CLOCK.resize)) {

				_CLOCK.resize = Date.now();
				_reshape_viewport();

			}

		},

		focus: function() {

			if (_focusactive === false) {

				for (let i = 0, l = _INSTANCES.length; i < l; i++) {
					_process_show.call(_INSTANCES[i]);
				}

				_focusactive = true;

			}

		},

		blur: function() {

			if (_focusactive === true) {

				for (let i = 0, l = _INSTANCES.length; i < l; i++) {
					_process_hide.call(_INSTANCES[i]);
				}

				_focusactive = false;

			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	let _enterFullscreen = null;
	let _leaveFullscreen = null;

	(function() {

		let resize      = 'onresize' in global;
		let orientation = 'onorientationchange' in global;
		let focus       = 'onfocus' in global;
		let blur        = 'onblur' in global;


		if (typeof global.addEventListener === 'function') {

			if (resize)      global.addEventListener('resize',            _listeners.resize,            true);
			if (orientation) global.addEventListener('orientationchange', _listeners.orientationchange, true);
			if (focus)       global.addEventListener('focus',             _listeners.focus,             true);
			if (blur)        global.addEventListener('blur',              _listeners.blur,              true);

		}


		if (global.document && global.document.documentElement) {

			let element = global.document.documentElement;

			if (typeof element.requestFullscreen === 'function' && typeof element.exitFullscreen === 'function') {

				_enterFullscreen = function() {
					element.requestFullscreen();
				};

				_leaveFullscreen = function() {
					element.exitFullscreen();
				};

			}


			if (_enterFullscreen === null || _leaveFullscreen === null) {

				let prefixes = [ 'moz', 'ms', 'webkit' ];
				let prefix   = null;

				for (let p = 0, pl = prefixes.length; p < pl; p++) {

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

			let methods = [];

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

	const _process_show = function() {

		return this.trigger('show');

	};

	const _process_hide = function() {

		return this.trigger('hide');

	};

	const _process_orientation = function(orientation) {

		orientation = typeof orientation === 'number' ? orientation : null;

		if (orientation !== null) {
			this.__orientation = orientation;
		}

	};

	const _process_reshape = function(width, height) {

		if (width === this.width && height === this.height) {
			return false;
		}


		this.width  = width;
		this.height = height;


		let orientation = null;
		let rotation    = null;


		if (this.__orientation === 0) {

			/*  _______
			 * |       |
			 * |       |
			 * |       |
			 * |       |
			 * |       |
			 * [X][X][X]
			 */

			if (width > height) {

				orientation = 'landscape';
				rotation    = 'landscape';

			} else {

				orientation = 'portrait';
				rotation    = 'portrait';

			}

		} else if (this.__orientation === 180) {

			/* [X][X][X]
			 * |       |
			 * |       |
			 * |       |
			 * |       |
			 * |_______|
			 */

			if (width > height) {

				orientation = 'landscape';
				rotation    = 'landscape';

			} else {

				orientation = 'portrait';
				rotation    = 'portrait';

			}

		} else if (this.__orientation === 90) {

			/*  ____________
			 * |            [x]
			 * |            [x]
			 * |____________[x]
			 */

			if (width > height) {

				orientation = 'portrait';
				rotation    = 'landscape';

			} else {

				orientation = 'landscape';
				rotation    = 'portrait';

			}

		} else if (this.__orientation === -90) {

			/*    ____________
			 * [x]            |
			 * [x]            |
			 * [x]____________|
			 */

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

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.fullscreen = false;
		this.width      = global.innerWidth  | 0;
		this.height     = global.innerHeight | 0;

		this.__orientation = typeof global.orientation === 'number' ? global.orientation : 0;


		_Emitter.call(this);

		_INSTANCES.push(this);


		this.setFullscreen(states.fullscreen);



		/*
		 * INITIALIZATION
		 */

		setTimeout(_ => {

			this.width  = 0;
			this.height = 0;

			_process_reshape.call(this, global.innerWidth | 0, global.innerHeight | 0);

		}, 100);


		states = null;

	};


	Composite.prototype = {

		destroy: function() {

			let found = false;

			for (let i = 0, il = _INSTANCES.length; i < il; i++) {

				if (_INSTANCES[i] === this) {
					_INSTANCES.splice(i, 1);
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

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.Viewport';

			let states = {};


			if (this.fullscreen !== false) states.fullscreen = this.fullscreen;


			data['arguments'][0] = states;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setFullscreen: function(fullscreen) {

			fullscreen = typeof fullscreen === 'boolean' ? fullscreen : null;


			if (fullscreen !== null) {

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

			}


			return false;

		}

	};


	return Composite;

});

