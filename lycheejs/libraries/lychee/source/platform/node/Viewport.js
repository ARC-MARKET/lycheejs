
lychee.define('lychee.Viewport').tags({
	platform: 'node'
}).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (
		typeof global.process !== 'undefined'
		&& typeof global.process.stdout === 'object'
		&& typeof global.process.stdout.on === 'function'
	) {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	const _process   = global.process;
	const _Emitter   = lychee.import('lychee.event.Emitter');
	const _INSTANCES = [];



	/*
	 * EVENTS
	 */

	const _listeners = {

		resize: function() {

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				_process_reshape.call(_INSTANCES[i], _process.stdout.columns, _process.stdout.rows);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		let resize = true;
		if (resize === true) {
			_process.stdout.on('resize', _listeners.resize);
		}


		if (lychee.debug === true) {

			let methods = [];

			if (resize) methods.push('Resize');

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

			orientation = 'landscape';
			rotation    = 'landscape';

		}


		return this.trigger('reshape', [ orientation, rotation, width, height ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.fullscreen = false;
		this.width      = _process.stdout.columns;
		this.height     = _process.stdout.rows;

		this.__orientation = 0;


		_Emitter.call(this);

		_INSTANCES.push(this);


		this.setFullscreen(states.fullscreen);



		/*
		 * INITIALIZATION
		 */

		setTimeout(_ => {

			this.width  = 0;
			this.height = 0;

			_process_reshape.call(this, _process.stdout.columns, _process.stdout.rows);

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

				// XXX: No fullscreen support

			}


			return false;

		}

	};


	return Composite;

});

