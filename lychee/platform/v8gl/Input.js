
lychee.define('Input').tags({
	platform: 'v8gl'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		global.glut
		&& (
			(
				typeof global.glut.keyboardFunc === 'function'
				&& typeof global.glut.getModifiers === 'function'
			) || (
				typeof global.glut.mouseFunc === 'function'
				&& typeof global.glut.motionFunc === 'function'
			)
		)
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var _instances = [];

	var _listeners = {

		keyboard: function(key, x, y) {

			var modifiers = glut.getModifiers();

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processKey(key, modifiers);
			}

		},

		mouse: function(button, state, x, y) {

			if (button === glut.LEFT_BUTTON) {

				if (state === glut.DOWN) {

					for (var i = 0, l = _instances.length; i < l; i++) {
						_instances[i].__processTouch(0, x, y);
					}

				} else if (state === glut.UP) {

					for (var i = 0, l = _instances.length; i < l; i++) {
						_instances[i].__processSwipe(0, 'end', x, y);
					}

				}

			}

		},

		motion: function(x, y) {

			for (var i = 0, l = _instances.length; i < l; i++) {
				_instances[i].__processSwipe(0, 'move', x, y);
			}

		}

	};


	(function() {

		var keyboard = 'keyboardFunc' in global.glut && 'getModifiers' in global.glut;
		if (keyboard === true) {
			glut.keyboardFunc(_listeners.keyboard);
		}

		var touch = false;
		var mouse = 'mouseFunc' in global.glut && 'motionFunc' in global.glut;
		if (touch === true) {
			// TODO: Implement touch support
		} else if (mouse === true) {
			glut.mouseFunc(_listeners.mouse);
			glut.motionFunc(_listeners.motion);
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

		__processKey: function(key, mod) {

			if (this.__fireKey === false) return;


			// 1. Validate key event
			var code = key.charCodeAt(0);
			if (Class.KEYMAP[code] === undefined) {
				return;
			}


			// 2. Only fire after the enforced delay
			var delta = Date.now() - this.__clock.key;
			if (delta < this.__delay) {
				return;
			}


			// 3. Check for current key being a modifier
			if (
				this.__fireModifier === false
				&& mod !== 0
			) {
				return;
			}


			var ctrl         = glut.ACTIVE_CTRL;
			var alt          = glut.ACTIVE_ALT;
			var shift        = glut.ACTIVE_SHIFT;
			var ctrlAltShift = glut.ACTIVE_CTRL | glut.ACTIVE_ALT   | glut.ACTIVE_SHIFT;
			var ctrlAlt      = glut.ACTIVE_CTRL | glut.ACTIVE_ALT;
			var ctrlShift    = glut.ACTIVE_CTRL | glut.ACTIVE_SHIFT;
			var altShift     = glut.ACTIVE_ALT  | glut.ACTIVE_SHIFT;


			var name = '';

			switch (mod) {

				case ctrlAltShift: name = 'ctrl-alt-shift-'; break;
				case ctrlAlt:      name = 'ctrl-alt-';       break;
				case ctrlShift:    name = 'ctrl-shift-';     break;
				case altShift:     name = 'alt-shift-';      break;
				case ctrl:         name = 'ctrl-';           break;
				case alt:          name = 'alt-';            break;
				case shift:        name = 'shift-';          break;

			}


			name += Class.KEYMAP[code].toLowerCase();


			if (lychee.debug === true) {
				console.log('lychee.Input:', Class.KEYMAP[code], name, delta);
			}


			// allow bind('key') and bind('ctrl-a');
			this.trigger('key', [ Class.KEYMAP[code], name, delta ]);
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
				x: x, y: y
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

