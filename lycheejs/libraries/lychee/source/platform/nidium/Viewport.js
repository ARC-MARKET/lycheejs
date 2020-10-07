
lychee.define('lychee.Viewport').tags({
	platform: 'nidium'
}).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (
		typeof global.window !== 'undefined'
		&& typeof global.window.innerWidth === 'number'
		&& typeof global.window.innerHeight === 'number'
		&& typeof global.window.__nidium__ === 'object'
	) {

		return true;

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _Emitter   = lychee.import('lychee.event.Emitter');
	const _INSTANCES = [];
	const _window    = global.window || null;



	/*
	 * EVENTS
	 */

	let _focusactive = true;

	const _listeners = {

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

	(function() {

		if (_window === null) {
			return;
		}


		let focus = '_onfocus' in _window;
		let blur  = '_onblur' in _window;

		if (focus) _window._onfocus = _listeners.focus;
		if (blur)  _window._onblur  = _listeners.blur;


		if (lychee.debug === true) {

			let methods = [];

			if (focus) methods.push('Focus');
			if (blur)  methods.push('Blur');

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

	const _process_reshape = function(width, height) {

		if (width === this.width && height === this.height) {
			return false;
		}


		this.width  = width;
		this.height = height;


		let orientation = null;
		let rotation    = null;


		if (width > height) {

			/*  ___________
			 * |           |
			 * |           |
			 * |           |
			 * |_[X][X][X]_|
			 */

			orientation = 'landscape';
			rotation    = 'landscape';

		} else {

			/*  _______
			 * |       |
			 * |       |
			 * |       |
			 * |       |
			 * |       |
			 * [X][X][X]
			 */

			orientation = 'portrait';
			rotation    = 'portrait';

		}


		return this.trigger('reshape', [ orientation, rotation, width, height ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.fullscreen = false;
		this.width      = _window.innerWidth  | 0;
		this.height     = _window.innerHeight | 0;


		_Emitter.call(this);

		_INSTANCES.push(this);


		this.setFullscreen(states.fullscreen);



		/*
		 * INITIALIZATION
		 */

		setTimeout(_ => {

			this.width  = 0;
			this.height = 0;

			_process_reshape.call(this, _window.innerWidth | 0, _window.innerHeight | 0);

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

				// XXX: No Fullscreen support
				// https://github.com/nidium/Nidium/issues/65

			}


			return false;

		}

	};


	return Composite;

});

