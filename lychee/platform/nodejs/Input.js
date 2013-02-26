
lychee.define('Input').tags({
	platform: 'nodejs'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		typeof process !== 'undefined'
		&& process.stdin
		&& typeof process.stdin.on === 'function'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var _instances = [];

	var _listeners = {

		keyboard: function(chunk, key) {

			// This is apparently a hack to have a TTY conform behaviour
			if (key && key.ctrl && key.name === 'c') {
				process.exit();
			} else if (
				key.sequence !== undefined
				|| key.name !== undefined
			) {

				var k = key.name !== undefined ? key.name : key.sequence;

				for (var i = 0, l = _instances.length; i < l; i++) {
					_instances[i].__processKey(k, key.ctrl, key.meta, key.shift);
				}

			} else if (lychee.debug === true) {
				console.error('lychee.Input: INVALID KEY ', key);
			}

		}

	};


	(function() {

		var keyboard = true;
		if (keyboard === true) {
			process.stdin.on('keypress', _listeners.keyboard).resume();
		}

		process.stdin.setRawMode(true);
		process.stdin.resume();


		// NodeJS has no theoretical support for both Touch and Mouse
		var touch = false;
		var mouse = false;


		if (lychee.debug === true) {

			var methods = [];
			if (keyboard) methods.push('Keyboard');
			if (touch)    methods.push('Touch');
			if (mouse)    methods.push('Mouse');

			if (methods.length === 0) methods.push("NONE");

			console.log('lychee.Input: Supported input methods are ' + methods.join(', '));

		}

	})();


	var Class = function(data) {

		var settings = lychee.extend({}, data);

		settings.fireKey      = !!settings.fireKey;
		settings.fireModifier = !!settings.fireModifier;
		settings.delay        = typeof settings.delay === 'number' ? settings.delay : 0;


		this.__fireKey      = settings.fireKey;
		this.__fireModifier = settings.fireModifier;
		this.__fireTouch    = false;
		this.__fireSwipe    = false;
		this.__delay        = settings.delay;

		this.reset();


		lychee.event.Emitter.call(this, 'input');

		_instances.push(this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function() {

			this.__clock      = null; // GC hint
			this.__clock      = {
				key:   Date.now(),
				touch: Date.now(),
				swipe: Date.now()
			};

		},

		addToucharea: function(id, box) {

			// No touch support, so this method does nothing.
			return false;

		},

		removeToucharea: function(id) {

			// No touch support, so this method does nothing.
			return false;

		},



		/*
		 * PRIVATE API
		 */

		__processKey: function(key, ctrl, alt, shift) {

			if (this.__fireKey === false) return;


			// 2. Only fire after the enforced delay
			var delta = Date.now() - this.__clock.key;
			if (delta < this.__delay) {
				return;
			}


			// 3. Check for current key being a modifier
			/*
			 * TODO: Modifier support is missing, I have
			 * no idea how to work around the TTY behaviour.
			 *
			 */
			if (
				this.__fireModifier === false
				&& (key === 'ctrl' || key === 'meta' || key === 'shift')
			) {
				return;
			}


			var name = '';

			if (ctrl)   name += 'ctrl-';
			if (alt)    name += 'alt-';
			if (shift)  name += 'shift-';

			name += key.toLowerCase();


			if (lychee.debug === true) {
				console.log('lychee.Input:', key, name, delta);
			}


			// allow bind('key') and bind('ctrl-a');
			this.trigger('key', [ key, name, delta ]);
			this.trigger(name, [ delta ]);


			this.__clock.key = Date.now();

		}

	};


	return Class;

});

