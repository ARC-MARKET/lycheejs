
lychee.define('Viewport').tags({
	platform: 'nodejs'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		typeof process !== 'undefined'
		&& process.stdout
		&& typeof process.stdout.on === 'function'
	) {
		return true;
	}

	return false;

}).exports(function(lychee, global) {

	var _instances = [];

	var _listeners = {

		resize: function() {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processReshape(process.stdout.columns, process.stdout.rows);
			}

		}

	};


	(function() {

		var resize = true; // No way to detect that
		if (resize) {
			process.stdout.on('resize', _listeners.resize);
		}


		if (lychee.debug === true) {

			var methods = [];
			if (resize) methods.push('resize');

			if (methods.length === 0) methods.push('NONE');

			console.log('lychee.Viewport: Supported methods are ' + methods.join(', '));

		}

	})();


	var Class = function() {

		this.__orientation = null; // Unsupported
		this.__width  = process.stdout.columns;
		this.__height = process.stdout.rows;


		lychee.event.Emitter.call(this, 'viewport');

		_instances.push(this);

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */

		__processReshape: function(width, height) {

			this.__width  = width;
			this.__height = height;


			if (width > height) {

				this.trigger('reshape', [
					'landscape',
					'landscape',
					this.__width,
					this.__height
				]);

			} else {

				this.trigger('reshape', [
					'portrait',
					'portrait',
					this.__width,
					this.__height
				]);

			}

		}

	};


	return Class;

});

