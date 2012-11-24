
lychee.define('Input').tags({
	platform: 'v8gl'
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


			65: 'A',
			66: 'B',
			67: 'C',
			68: 'D',
			69: 'E',
			70: 'F',
			71: 'G',
			72: 'H',
			73: 'I',
			74: 'J',
			75: 'K',
			76: 'L',
			77: 'M',
			78: 'N',
			79: 'O',
			80: 'P',
			81: 'Q',
			82: 'R',
			83: 'S',
			84: 'T',
			85: 'U',
			86: 'V',
			87: 'W',
			88: 'X',
			89: 'Y',
			90: 'Z',

			97: 'a',
			98: 'b',
			99: 'c',
			100: 'd',
			101: 'e',
			102: 'f',
			103: 'g',
			104: 'h',
			105: 'i',
			106: 'j',
			107: 'k',
			108: 'l',
			109: 'm',
			110: 'n',
			111: 'o',
			112: 'p',
			113: 'q',
			114: 'r',
			115: 's',
			116: 't',
			117: 'u',
			118: 'v',
			119: 'w',
			120: 'x',
			121: 'y',
			122: 'z'

		},



		/*
		 * PRIVATE API
		 */
		__init: function() {

			var that = this;

			if (_alreadyBound === true) return;


			var supportsKeyboard = 'keyboardFunc' in global.glut && 'getModifiers' in global.glut;
			if (supportsKeyboard === true) {

				glut.keyboardFunc(function(key, x, y) {

					var modifiers = glut.getModifiers();
					that.__processKey(key, modifiers);

				});

			}


			var supportsMouse = 'mouseFunc' in global.glut && 'motionFunc' in global.glut;
			if (supportsMouse === true) {

				if (this.settings.fireSwipe === true) {

					glut.mouseFunc(function(button, state, x, y) {

						if (button === glut.LEFT_BUTTON) {

							if (state === glut.DOWN) {
								that.__processTouch(x, y);
							} else if (state === glut.UP) {
								that.__processSwipe('end', x, y);
							}

						}

					});

					glut.motionFunc(function(x, y) {
						that.__processSwipe('move', x, y);
					});

				} else {

					glut.mouseFunc(function(button, state, x, y) {

						if (button === glut.LEFT_BUTTON && state === glut.DOWN) {
							that.__processTouch(x, y);
						}

					});

				}

			}


			var supportsTouch = false;
			var supportsPointer = false;


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

		__processKey: function(key, mod) {

			var code = key.charCodeAt(0);
			if (this.KEYMAP[code] === undefined) {
				return;
			}

			if (
				this.settings.fireModifiers === false
				&& mod !== 0
			) {
				return;
			}


			var delta = Date.now() - this.__last.key;
			if (delta < this.settings.delay) {
				return;
			}

			var ctrlAltShift = glut.ACTIVE_CTRL | glut.ACTIVE_ALT | glut.ACTIVE_SHIFT;
			var ctrlAlt      = glut.ACTIVE_CTRL | glut.ACTIVE_ALT;
			var ctrlShift    = glut.ACTIVE_CTRL | glut.ACTIVE_SHIFT;
			var altShift     = glut.ACTIVE_ALT | glut.ACTIVE_SHIFT;


			// FIXME: This is somehow weird, but switch/case isn't typedef.
			var name = '';
			if (mod === ctrlAltShift) {
				name = 'ctrl-alt-shift-';
			} else if (mod === ctrlAlt) {
				name = 'ctrl-alt-';
			} else if (mod === ctrlShift) {
				name = 'ctrl-shift-';
			} else if (mod === altShift) {
				name = 'alt-shift-';
			} else if (mod === glut.ACTIVE_CTRL) {
				name = 'ctrl-';
			} else if (mod === glut.ACTIVE_ALT) {
				name = 'alt-';
			} else if (mod === glut.ACTIVE_SHIFT) {
				name = 'shift-';
			}

			name += this.KEYMAP[code].toLowerCase();


			if (lychee.debug === true) {
				console.log('lychee.Input:', this.KEYMAP[code], name, delta);
			}


			// allow both bind('key') and bind('ctrl-a')
			this.trigger('key', [ this.KEYMAP[code], name, delta ]);
			this.trigger(name, [ delta ]);


			this.__last.key = Date.now();

		},

		__processTouch: function(x, y) {

			var delta = Date.now() - this.__last.touch;
			if (delta < this.settings.delay) {
				return;
			}


			// Don't cancel the swipe by default
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

