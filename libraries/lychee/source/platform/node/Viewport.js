
lychee.define('Viewport').tags({
	platform: 'node'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof process !== 'undefined') {

		if (typeof process.stdout === 'object' && typeof process.stdout.on === 'function') {
			return true;
		}

	}

	return false;

}).exports(function(lychee, global, attachments) {

	/*
	 * EVENTS
	 */

	var _instances = [];

	var _listeners = {

		resize: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_process_reshape.call(_instances[i], process.stdout.columns, process.stdout.rows);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		var resize = true;
		if (resize === true) {
			process.stdout.on('resize', _listeners.resize);
		}


		if (lychee.debug === true) {

			var methods = [];

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

	var _process_reshape = function(width, height) {

		if (width === this.width && height === this.height) {
			return false;
		}


		this.width  = width;
		this.height = height;



		var orientation = null;
		var rotation    = null;

		if (width > height) {

			orientation = 'landscape';
			rotation    = 'landscape';

		} else {

			orientation = 'landscape';
			rotation    = 'landscape';

		}


		return this.trigger('reshape', [ orientation, rotation, width, height ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.fullscreen = false;
		this.width      = process.stdout.columns;
		this.height     = process.stdout.rows;

		this.__orientation = 0; // Unsupported


		lychee.event.Emitter.call(this);

		_instances.push(this);


		this.setFullscreen(settings.fullscreen);



		/*
		 * INITIALIZATION
		 */

		setTimeout(function() {

			this.width  = 0;
			this.height = 0;

			_process_reshape.call(this, process.stdout.columns, process.stdout.rows);

		}.bind(this), 100);


		settings = null;

	};


	Composite.prototype = {

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
			return false;
		}

	};


	return Composite;

});

