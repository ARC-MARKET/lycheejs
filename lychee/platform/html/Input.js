
/*
 * var input = new lychee.Input({});
 *
 * There are two ways of binding to key events:
 *
 * input.bind('key', function(key, delta) {
 * }, this);
 *
 * input.bind('ctrl-a', function(delta) {
 * }, this);
 *
 * input.bind('touch', function(position, delta) {
 * }, this);
 *
 * input.bind('toucharea-test', function(delta) {
 * }, this);
 *
 *
 *
 * Setup of Touchareas:
 *
 * input.addToucharea('test', {
 *	x1:  20,
 *	y1:  20,
 *	x2: 100,
 *	y2: 100
 * });
 *
 */

lychee.define('Input').tags({
	platform: 'html'
}).includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var _alreadyBound = false;
	var _support = {};

	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);
		this.reset();

		lychee.Events.call(this, 'input');
		this.__init();

	};


	Class.prototype = {

		defaults: {
			delay: 200,
			fireModifiers: false,
			fireSwipe: false
		},

		KEYMAP: {

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

		},



		/*
		 * PRIVATE API
		 */
		__init: function() {

			var that = this;

			if (_alreadyBound === true) return;


			var supportsKeyboard = 'onkeydown' in global;
			if (supportsKeyboard === true) {

				document.addEventListener('keydown', function(event) {
					that.__processKey(event.keyCode, event.ctrlKey, event.altKey, event.shiftKey);
				}, true);

			}


			var supportsMouse = 'onmousedown' in global;
			var supportsTouch = 'ontouchstart' in global;

			if (supportsTouch === true) {

				document.addEventListener('touchstart', function(event) {

					event.preventDefault();
					event.stopPropagation();

					var touch = event;
					if (event.touches && event.touches.length) {
						touch = event.touches[0];
					}

					that.__processTouch(touch.pageX, touch.pageY);

				}, true);


				if (this.settings.fireSwipe === true) {

					document.addEventListener('touchmove', function(event) {

						var touch = event;
						if (event.touches && event.touches.length) {
							touch = event.touches[0];
						}

						that.__processSwipe('move', touch.pageX, touch.pageY);

					}, true);

					document.addEventListener('touchend', function(event) {

						var touch = event;
						if (event.touches && event.touches.length) {
							touch = event.touches[0];
						}

						that.__processSwipe('end', touch.pageX, touch.pageY);

					}, true);

				}

			} else if (supportsMouse === true) {

				document.addEventListener('mousedown', function(event) {
					that.__processTouch(event.pageX, event.pageY);
				}, true);


				if (this.settings.fireSwipe === true) {

					document.addEventListener('mousemove', function(event) {
						that.__processSwipe('move', event.pageX, event.pageY);
					}, true);

					document.addEventListener('mouseup', function(event) {
						that.__processSwipe('end', event.pageX, event.pageY);
					}, true);

					document.addEventListener('mouseout', function(event) {
						that.__processSwipe('end', event.pageX, event.pageY);
					}, true);

				}

			}


			var supportsPointer = false;
			var prefixes = [ '', 'ms', 'moz', 'o', 'webkit' ];
			var prefix = '';

			for (var p = 0, l = prefixes.length; p < l; p++) {

				var property = prefix === '' ? 'pointerenabled' : prefix + 'PointerEnabled';
				supportsPointer = !!(global.navigator && global.navigator[property]);

				if (supportsPointer === true) {
					break;
				}

			}


			if (supportsPointer === true) {

				var events = null;
				if (prefix !== '') {
					prefix = prefix.toUpperCase();
					events = [ prefix + 'PointerDown', prefix + 'PointerMove', prefix + 'PointerEnd', prefix + 'PointerCancel' ];
				} else {
					events = [ 'pointerDown', 'pointerMove', 'pointerEnd', 'pointerCancel' ];
				}

				document.addEventListener(events[0], function(event) {

					event.preventDefault();
					event.preventManipulation();

					that.__processTouch(event.pageX, event.pageY);

				}, true);


				if (this.settings.fireSwipe === true) {

					document.addEventListener(events[1], function(event) {
						that.__processSwipe('move', event.pageX, event.pageY);
					}, true);

					document.addEventListener(events[2], function(event) {
						that.__processSwipe('end', event.pageX, event.pageY);
					}, true);

					document.addEventListener(events[3], function(event) {
						that.__processSwipe('end', event.pageX, event.pageY);
					}, true);

				}

			}


			_support.keyboard = supportsKeyboard;
			_support.mouse = supportsMouse;
			_support.touch = supportsTouch;
			_support.pointer = supportsPointer;

			_alreadyBound = true;


			if (lychee.debug === true) {

				var message = 'lychee.Input: Supported input methods are ';

				var methods = [];

				if (supportsKeyboard) methods.push('Keyboard');
				if (supportsMouse) methods.push('Mouse');
				if (supportsTouch) methods.push('Touch');
				if (supportsPointer) methods.push('Pointer');

				if (methods.length === 0) methods.push("NONE");

				message += methods.join(', ');

				console.log(message);

			}

		},

		__processKey: function(code, ctrl, alt, shift) {

			// Don't fire unknown keys
			if (this.KEYMAP[code] === undefined) {
				return;
			}

			ctrl = ctrl === true ? true : false;
			alt = alt === true ? true : false;
			shift = shift === true ? true : false;


			var delta = Date.now() - this.__last.key;
			if (delta < this.settings.delay) {
				return;
			}

			if (
				this.settings.fireModifiers === false
				&& (code === 9 || code === 16 || code === 17 || code === 18)
				&& (ctrl === true || alt === true || shift === true)
			) {
				return;
			}


			var key = this.KEYMAP[code];

			var name = '';
			if (ctrl === true && this.KEYMAP[code] !== 'ctrl') {
				name += 'ctrl-';
			}

			if (alt === true && this.KEYMAP[code] !== 'alt') {
				name += 'alt-';
			}

			if (shift === true && this.KEYMAP[code] !== 'shift') {
				name += 'shift-';

				// Seriously, WTF is this shit?
				// t > T, but 0 > ! doesn't work.
				key = String.fromCharCode(code);

			}


			name += key.toLowerCase();


			if (lychee.debug === true) {
				console.log('lychee.Input:', key, name, delta);
			}


			// allow both bind('key') and bind('ctrl-a')
			this.trigger('key', [ key, name, delta ]);
			this.trigger(name, [ delta ]);


			this.__last.key = Date.now();

		},

		__processTouch: function(x, y) {

			var delta = Date.now() - this.__last.touch;
			if (delta < this.settings.delay) {
				return;
			}


			// Don't cancel the swipe event by default
			var cancelSwipe = this.trigger('touch', [ { x: x, y: y }, delta ]) === true;


			for (var id in this.__touchareas) {

				var toucharea = this.__touchareas[id];
				if (toucharea === null) continue;

				if (
					x > toucharea.x1 && x < toucharea.x2
					&& y > toucharea.y1 && y < toucharea.y2
				) {
					this.trigger('toucharea-' + toucharea.id, [ delta ]);
				}

			}

			this.__last.touch = Date.now();


			if (
				cancelSwipe !== true
				&& this.__swipe === null
				&& this.settings.fireSwipe === true
			) {

				this.trigger('swipe', [ 'start', { x: x, y: y }, delta ]);

				this.__swipe = {
					x: x,
					y: y
				};

			}

		},

		__processSwipe: function(state, x, y) {

			if (this.__swipe === null) return;

			var delta = Date.now() - this.__last.swipe;
			if (delta < this.settings.delay) {
				return;
			}


			var position = {
				x: x,
				y: y
			};

			var swipe = {
				x: position.x - this.__swipe.x,
				y: position.y - this.__swipe.y
			};


			if (state === 'move') {

				this.trigger('swipe', [ 'move', position, delta, swipe ]);

			} else if (state === 'end') {

				this.trigger('swipe', [ 'end', position, delta, swipe ]);
				this.__swipe = null;

			}

			this.__last.swipe = Date.now();

		},



		/*
		 * PUBLIC API
		 */
		reset: function() {

			this.__touchareas = {};
			this.__swipe = null;
			this.__last = {
				key: Date.now(),
				touch: Date.now(),
				swipe: Date.now()
			};

		},

		getSupport: function() {
			return _support;
		},

		addToucharea: function(id, box) {

			id = typeof id === 'string' ? id : null;

			if (
				id !== null
				&& Object.prototype.toString.call(box) === '[object Object]'
				&& this.__touchareas[id] === undefined
			) {

				var toucharea = {
					id: id,
					x1: box.x1 || 0,
					x2: box.x2 || Infinity,
					y1: box.y1 || 0,
					y2: box.y2 || Infinity
				};

				this.__touchareas[toucharea.id] = toucharea;

				return true;

			}


			return false;

		},

		removeToucharea: function(id) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && this.__touchareas[id] !== undefined) {

				this.__touchareas[id] = null;
				return true;

			}


			return false;

		}

	};


	return Class;

});

