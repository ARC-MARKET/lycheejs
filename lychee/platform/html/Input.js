
lychee.define('Input').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		global.document
		&& typeof global.document.addEventListener === 'function'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var _instances = [];

	var _mouseactive = false;
	var _listeners = {

		keydown: function(event) {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processKey(event.keyCode, event.ctrlKey, event.altKey, event.shiftKey);
			}

		},

		touchstart: function(event) {

			event.preventDefault();
			event.stopPropagation();


			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						_instances[i].__processTouch(t, event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_instances[i].__processTouch(0, event.pageX, event.pageY);
				}

			}

		},

		touchmove: function(event) {

			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						_instances[i].__processSwipe(t, 'move', event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_instances[i].__processSwipe(0, 'move', event.pageX, event.pageY);
				}

			}

		},

		touchend: function(event) {

			for (var i = 0, l = _instances.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (var t = 0, tl = event.touches.length; t < tl; t++) {
						_instances[i].__processSwipe(t, 'end', event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_instances[i].__processSwipe(0, 'end', event.pageX, event.pageY);
				}

			}

		},

		mousestart: function(event) {

			_mouseactive = true;

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processTouch(0, event.pageX, event.pageY);
			}

		},

		mousemove: function(event) {

			if (_mouseactive === false) return;

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processSwipe(0, 'move', event.pageX, event.pageY);
			}

		},

		mouseend: function(event) {

			if (_mouseactive === false) return;

			_mouseactive = false;

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processSwipe(0, 'end', event.pageX, event.pageY);
			}

		}

	};


	(function() {

		var keyboard = 'onkeydown' in global;
		if (keyboard === true) {
			document.addEventListener('keydown', _listeners.keydown, true);
		}

		var touch = 'ontouchstart' in global;
		var mouse = 'onmousedown' in global;
		if (touch === true) {
			document.addEventListener('touchstart', _listeners.touchstart, true);
			document.addEventListener('touchmove',  _listeners.touchmove,  true);
			document.addEventListener('touchend',   _listeners.touchend,   true);
		} else if (mouse === true) {
			document.addEventListener('mousedown',  _listeners.mousestart, true);
			document.addEventListener('mousemove',  _listeners.mousemove,  true);
			document.addEventListener('mouseup',    _listeners.mouseend,   true);
			document.addEventListener('mouseout',   _listeners.mouseend,   true);
		}


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
		settings.fireTouch    = !!settings.fireTouch;
		settings.fireSwipe    = !!settings.fireSwipe;
		settings.delay        = typeof settings.delay === 'number' ? settings.delay : 0;


		this.__fireKey      = settings.fireKey;
		this.__fireModifier = settings.fireModifier;
		this.__fireTouch    = settings.fireTouch;
		this.__fireSwipe    = settings.fireSwipe;
		this.__delay        = settings.delay;

		this.reset();


		lychee.event.Emitter.call(this, 'input');

		_instances.push(this);


		settings = null;

	};


	Class.KEYMAP = {

		 8: 'backspace',
		 9: 'tab',
		13: 'enter',
		16: 'shift',
		17: 'ctrl',
		18: 'alt',
		19: 'pause',

		27: 'escape',
		32: 'space',

		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',

		48: '0',
		49: '1',
		50: '2',
		51: '3',
		52: '4',
		53: '5',
		54: '6',
		55: '7',
		56: '8',
		57: '9',

		65: 'a',
		66: 'b',
		67: 'c',
		68: 'd',
		69: 'e',
		70: 'f',
		71: 'g',
		72: 'h',
		73: 'i',
		74: 'j',
		75: 'k',
		76: 'l',
		77: 'm',
		78: 'n',
		79: 'o',
		80: 'p',
		81: 'q',
		82: 'r',
		83: 's',
		84: 't',
		85: 'u',
		86: 'v',
		87: 'w',
		88: 'x',
		89: 'y',
		90: 'z'

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		reset: function() {

			this.__touchareas = null; // GC hint
			this.__touchareas = {};

			this.__swipes     = null; // GC hint
			this.__swipes     = {
				0: null, 1: null,
				2: null, 3: null,
				4: null, 5: null,
				6: null, 7: null,
				8: null, 9: null
			};

			this.__clock      = null; // GC hint
			this.__clock      = {
				key:   Date.now(),
				touch: Date.now(),
				swipe: Date.now()
			};

		},

		addToucharea: function(id, box) {

			id = typeof id === 'string' ? id : null;


			if (
				id !== null
				&& Object.prototype.toString.call(box) === '[object Object]'
				&& this.__touchareas[id] === undefined
			) {

				this.__touchareas[id] = {
					id: id,
					x1: typeof box.x1 === 'number' ? box.x1 : 0,
					x2: typeof box.x2 === 'number' ? box.x2 : Infinity,
					y1: typeof box.y1 === 'number' ? box.y1 : 0,
					y2: typeof box.y2 === 'number' ? box.y2 : Infinity
				};

				return true;

			}


			return false;

		},

		removeToucharea: function(id) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && this.__touchareas[id] !== undefined) {
				delete this.__touchareas[id];
				return true;
			}


			return false;

		},



		/*
		 * PRIVATE API
		 */

		__processKey: function(code, ctrl, alt, shift) {

			if (this.__fireKey === false) return;


			// 1. Validate key event
			if (Class.KEYMAP[code] === undefined) {
				return;
			}


			ctrl  =  ctrl === true ? true : false;
			alt   =   alt === true ? true : false;
			shift = shift === true ? true : false;


			// 2. Only fire after the enforced delay
			var delta = Date.now() - this.__clock.key;
			if (delta < this.__delay) {
				return;
			}


			// 3. Check for current key being a modifier
			if (
				this.__fireModifiers === false
				&& (code === 16   || code === 17   ||  code === 18)
				&& (ctrl === true ||  alt === true || shift === true)
			) {
				return;
			}


			var key  = Class.KEYMAP[code];
			var name = '';

			if (ctrl  === true && key !== 'ctrl')  name += 'ctrl-';
			if (alt   === true && key !== 'alt')   name += 'alt-';
			if (shift === true && key !== 'shift') {

				name += 'shift-';

				// WTF is this shit?
				// t > T, but 0 > ! doesn't work.
				key = String.fromCharCode(code);

			}


			name += key.toLowerCase();


			if (lychee.debug === true) {
				console.log('lychee.Input:', key, name, delta);
			}


			// allow bind('key') and bind('ctrl-a');
			this.trigger('key', [ key, name, delta ]);
			this.trigger(name, [ delta ]);


			this.__clock.key = Date.now();

		},

		__processTouch: function(id, x, y) {

			if (
				this.__fireTouch === false
				&& this.__fireSwipe === true
			) {

				if (this.__swipes[id] === null) {
					this.__processSwipe(id, 'start', x, y);
				}

				return;

			} else if (this.__fireTouch === false) {
				return;
			}


			// 1. Only fire after the enforced delay
			var delta = Date.now() - this.__clock.touch;
			if (delta < this.__delay) {
				return;
			}


			this.trigger('touch', [ id, { x: x, y: y }, delta ]);


			// 2. Fire known Touchareas
			for (var tid in this.__touchareas) {

				var toucharea = this.__touchareas[tid];

				if (
					x > toucharea.x1
					&& x < toucharea.x2
					&& y > toucharea.y1
					&& y < toucharea.y2
				) {
					this.trigger(
						'toucharea-' + tid,
						[ delta ]
					);
				}

			}


			this.__clock.touch = Date.now();


			// 3. Fire Swipe Start, but only for tracked touches
			if (this.__swipes[id] === null) {
				this.__processSwipe(id, 'start', x, y);
			}

		},

		__processSwipe: function(id, state, x, y) {

			if (this.__fireSwipe === false) return;

			// 1. Only fire after the enforced delay
			var delta = Date.now() - this.__clock.swipe;
			if (delta < this.__delay) {
				return;
			}


			var position = {
				x: x || this.__swipes[id].x,
				y: y || this.__swipes[id].y
			};

			var swipe = {
				x: 0, y: 0
			};

			if (this.__swipes[id] !== null) {
				swipe.x = x - this.__swipes[id].x;
				swipe.y = y - this.__swipes[id].y;
			}


			if (state === 'start') {

				this.trigger(
					'swipe',
					[ id, 'start', position, delta, swipe ]
				);

				this.__swipes[id] = {
					x: x, y: y
				};

			} else if (state === 'move') {

				this.trigger(
					'swipe',
					[ id, 'move', position, delta, swipe ]
				);

			} else if (state === 'end') {

				this.trigger(
					'swipe',
					[ id, 'end', position, delta, swipe ]
				);

				this.__swipes[id] = null;

			}


			this.__clock.swipe = Date.now();

		}

	};


	return Class;

});

