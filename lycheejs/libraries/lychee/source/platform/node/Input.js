
lychee.define('lychee.Input').tags({
	platform: 'node'
}).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (
		typeof global.process !== 'undefined'
		&& typeof global.process.stdin === 'object'
		&& typeof global.process.stdin.on === 'function'
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

		keypress: function(key) {

			// TTY conform behaviour
			if (key.ctrl === true && key.name === 'c') {

				key.name  = 'escape';
				key.ctrl  = false;
				key.alt   = false;
				key.shift = false;

			}


			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				_process_key.call(_INSTANCES[i], key.name, key.ctrl, key.meta, key.shift);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		let keypress = true;
		if (keypress === true) {
			_process.stdin.on('keypress', _listeners.keypress);
		}


		if (lychee.debug === true) {

			let methods = [];

			if (keypress) methods.push('Keyboard');

			if (methods.length === 0) {
				console.error('lychee.Input: Supported methods are NONE');
			} else {
				console.info('lychee.Input: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * HELPERS
	 */

	const _process_key = function(key, ctrl, alt, shift) {

		if (this.key === false) {

			return false;

		} else if (this.keymodifier === false) {

			if (key === 'ctrl' || key === 'meta' || key === 'shift') {
				return true;
			}

		}


		let name    = '';
		let handled = false;
		let delta   = Date.now() - this.__clock.key;

		if (delta < this.delay) {
			return true;
		} else {
			this.__clock.key = Date.now();
		}


		// 0. Computation: Normal Characters
		if (ctrl  === true) name += 'ctrl-';
		if (alt   === true) name += 'alt-';
		if (shift === true) name += 'shift-';

		name += key.toLowerCase();


		// 1. Event API
		if (key !== null) {

			// allow bind('key') and bind('ctrl-a');

			handled = this.trigger('key', [ key, name, delta ]) || handled;
			handled = this.trigger(name,  [ delta ])            || handled;

		}


		return handled;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.delay       = 0;
		this.key         = false;
		this.keymodifier = false;
		this.touch       = false;
		this.swipe       = false;

		this.__clock  = {
			key:   Date.now(),
			touch: Date.now(),
			swipe: Date.now()
		};


		this.setDelay(states.delay);
		this.setKey(states.key);
		this.setKeyModifier(states.keymodifier);
		this.setTouch(states.touch);
		this.setSwipe(states.swipe);


		_Emitter.call(this);

		_INSTANCES.push(this);

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
			data['constructor'] = 'lychee.Input';

			let states = {};


			if (this.delay !== 0)           states.delay       = this.delay;
			if (this.key !== false)         states.key         = this.key;
			if (this.keymodifier !== false) states.keymodifier = this.keymodifier;
			if (this.touch !== false)       states.touch       = this.touch;
			if (this.swipe !== false)       states.swipe       = this.swipe;


			data['arguments'][0] = states;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setDelay: function(delay) {

			delay = typeof delay === 'number' ? delay : null;


			if (delay !== null) {

				this.delay = delay;

				return true;

			}


			return false;

		},

		setKey: function(key) {

			key = typeof key === 'boolean' ? key : null;


			if (key !== null) {

				this.key = key;

				return true;

			}


			return false;

		},

		setKeyModifier: function(keymodifier) {

			keymodifier = typeof keymodifier === 'boolean' ? keymodifier : null;


			if (keymodifier !== null) {

				this.keymodifier = keymodifier;

				return true;

			}


			return false;

		},

		setTouch: function(touch) {

			touch = typeof touch === 'boolean' ? touch : null;


			if (touch !== null) {

				// XXX: No touch support

			}


			return false;

		},

		setScroll: function(scroll) {

			scroll = typeof scroll === 'boolean' ? scroll : null;


			if (scroll !== null) {

				// XXX: No scroll support

			}


			return false;

		},

		setSwipe: function(swipe) {

			swipe = typeof swipe === 'boolean' ? swipe : null;


			if (swipe !== null) {

				// XXX: No swipe support

			}


			return false;

		}

	};


	return Composite;

});

