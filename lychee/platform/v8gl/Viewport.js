
lychee.define('Viewport').tags({
	platform: 'v8gl'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (global.glut) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var _instances = [];

	var _listeners = {

		reshape: function(width, height) {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processReshape(width, height);
			}

		},

		visibility: function(state) {

			if (state === glut.VISIBLE) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].__processShow();
				}

			} else if (state === glut.NOT_VISIBLE) {

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].__processShow();
				}

			}

		}

	};


	(function() {

		var reshape = 'reshapeFunc' in global.glut;
		if (reshape === true) {
			glut.reshapeFunc(_listeners.reshape);
		}

		var visibility = 'visibilityFunc' in global.glut;
		if (visibility === true) {
			glut.visibilityFunc(_listeners.visibility);
		}


		if (lychee.debug === true) {

			var methods = [];
			if (reshape)    methods.push('reshapeFunc');
			if (visibility) methods.push('visibilityFunc');

			if (methods.length === 0) methods.push('NONE');

			console.log('lychee.Viewport: Supported methods are ' + methods.join(', '));

		}

	})();


	var Class = function() {

		this.__orientation = null; // Unsupported by freeglut
		this.__width = 0;
		this.__height = 0;


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

		},

		__processShow: function() {
			this.trigger('show', []);
		},

		__processHide: function() {
			this.trigger('hide', []);
		}

	};


	return Class;

});

