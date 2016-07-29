
lychee.define('Input').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof global.addEventListener === 'function') {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _Emitter   = lychee.import('lychee.event.Emitter');
	const _INSTANCES = [];



	/*
	 * EVENTS
	 */

	let _mouseactive = false;
	let _wheelactive = Date.now();

	const _listeners = {

		keydown: function(event) {

			let handled = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				handled = _process_key.call(_INSTANCES[i], event.keyCode, event.ctrlKey, event.altKey, event.shiftKey) || handled;
			}


			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		touchstart: function(event) {

			let handled = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (let t = 0, tl = event.touches.length; t < tl; t++) {
						handled = _process_touch.call(_INSTANCES[i], t, event.touches[t].pageX, event.touches[t].pageY) || handled;
					}

				} else {
					handled = _process_touch.call(_INSTANCES[i], 0, event.pageX, event.pageY) || handled;
				}

			}


			// Prevent scrolling and swiping behaviour
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		touchmove: function(event) {

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (let t = 0, tl = event.touches.length; t < tl; t++) {
						_process_swipe.call(_INSTANCES[i], t, 'move', event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_process_swipe.call(_INSTANCES[i], 0, 'move', event.pageX, event.pageY);
				}

			}

		},

		touchend: function(event) {

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {

				if (event.touches && event.touches.length) {

					for (let t = 0, tl = event.touches.length; t < tl; t++) {
						_process_swipe.call(_INSTANCES[i], t, 'end', event.touches[t].pageX, event.touches[t].pageY);
					}

				} else {
					_process_swipe.call(_INSTANCES[i], 0, 'end', event.pageX, event.pageY);
				}

			}

		},

		mousestart: function(event) {

			_mouseactive = true;


			let handled = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				handled = _process_touch.call(_INSTANCES[i], 0, event.pageX, event.pageY) || handled;
			}


			// Prevent drag of canvas as image
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		mousemove: function(event) {

			if (_mouseactive === false) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}


			let handled = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				handled = _process_swipe.call(_INSTANCES[i], 0, 'move', event.pageX, event.pageY) || handled;
			}


			// Prevent selection of canvas as content
			if (handled === true) {
				event.preventDefault();
				event.stopPropagation();
			}

		},

		mouseend: function(event) {

			if (_mouseactive === false) return;

			_mouseactive = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				_process_swipe.call(_INSTANCES[i], 0, 'end', event.pageX, event.pageY);
			}

		},

		mousewheel: function(event) {

			let time = Date.now();
			if (time < _wheelactive + 100) {
				_wheelactive = time;
				return;
			}

			_wheelactive = time;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				_process_scroll.call(_INSTANCES[i], 0, event.pageX, event.pageY, event.wheelDeltaX, event.wheelDeltaY);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		let keyboard = 'onkeydown' in global;
		let touch    = 'ontouchstart' in global;
		let mouse    = 'onmousedown' in global;


		if (typeof global.addEventListener === 'function') {

			if (keyboard) {
				global.addEventListener('keydown',    _listeners.keydown,    true);
			}

			if (touch) {

				global.addEventListener('touchstart', _listeners.touchstart, true);
				global.addEventListener('touchmove',  _listeners.touchmove,  true);
				global.addEventListener('touchend',   _listeners.touchend,   true);

			} else if (mouse) {

				global.addEventListener('mousedown',  _listeners.mousestart, true);
				global.addEventListener('mousemove',  _listeners.mousemove,  true);
				global.addEventListener('mouseup',    _listeners.mouseend,   true);
				global.addEventListener('mouseout',   _listeners.mouseend,   true);
				global.addEventListener('mousewheel', _listeners.mousewheel, true);

			}

		}


		if (lychee.debug === true) {

			let methods = [];

			if (keyboard) methods.push('Keyboard');
			if (touch)    methods.push('Touch');
			if (mouse)    methods.push('Mouse');

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

	const _KEYMAP = {

		 8:  'backspace',
		 9:  'tab',
		13:  'enter',
		16:  'shift',
		17:  'ctrl',
		18:  'alt',
		19:  'pause',
//		20:  'capslock',

		27:  'escape',
		32:  'space',
		33:  'page-up',
		34:  'page-down',
		35:  'end',
		36:  'home',

		37:  'arrow-left',
		38:  'arrow-up',
		39:  'arrow-right',
		40:  'arrow-down',

		45:  'insert',
		46:  'delete',

		65:  'a',
		66:  'b',
		67:  'c',
		68:  'd',
		69:  'e',
		70:  'f',
		71:  'g',
		72:  'h',
		73:  'i',
		74:  'j',
		75:  'k',
		76:  'l',
		77:  'm',
		78:  'n',
		79:  'o',
		80:  'p',
		81:  'q',
		82:  'r',
		83:  's',
		84:  't',
		85:  'u',
		86:  'v',
		87:  'w',
		88:  'x',
		89:  'y',
		90:  'z',

		96:  '0',
		97:  '1',
		98:  '2',
		99:  '3',
		100: '4',
		101: '5',
		102: '6',
		103: '7',
		104: '8',
		105: '9',
		106: '*',
		107: '+',
		109: '-',
		110: '.',
		111: '/',

		112: 'f1',
		113: 'f2',
		114: 'f3',
		115: 'f4',
		116: 'f5',
		117: 'f6',
		118: 'f7',
		119: 'f8',
		120: 'f9',
		121: 'f10',
		122: 'f11',
		123: 'f12',

//		144: 'numlock',
		145: 'scroll'

	};

	const _SPECIALMAP = {

		48:  [ '0', ')' ],
		49:  [ '1', '!' ],
		50:  [ '2', '@' ],
		51:  [ '3', '#' ],
		52:  [ '4', '$' ],
		53:  [ '5', '%' ],
		54:  [ '6', '^' ],
		55:  [ '7', '&' ],
		56:  [ '8', '*' ],
		57:  [ '9', '(' ],

		186: [ ';', ':' ],
		187: [ '=', '+' ],
		188: [ ',', '<' ],
		189: [ '-', '_' ],
		190: [ '.', '>' ],
		191: [ '/', '?' ],
		192: [ '`', '~' ],

		219: [ '[',  '{' ],
		220: [ '\\', '|' ],
		221: [ ']',  '}' ],
		222: [ '\'', '"' ]

	};

	const _process_key = function(code, ctrl, alt, shift) {

		if (this.key === false) return false;


		// 1. Validate key event
		if (_KEYMAP[code] === undefined && _SPECIALMAP[code] === undefined) {
			return false;
		}


		ctrl  =  ctrl === true;
		alt   =   alt === true;
		shift = shift === true;


		// 2. Only fire after the enforced delay
		let delta = Date.now() - this.__clock.key;
		if (delta < this.delay) {
			return true;
		}


		// 3. Check for current key being a modifier
		if (this.keymodifier === false) {

			if (code === 16 && shift === true) {
				return true;
			}

			if (code === 17 && ctrl === true) {
				return true;
			}

			if (code === 18 && alt === true) {
				return true;
			}

		}


		let key  = null;
		let name = null;
		let tmp  = null;

		// 3a. Check for special characters (that can be shifted)
		if (_SPECIALMAP[code] !== undefined) {

			tmp  = _SPECIALMAP[code];
			key  = shift === true ? tmp[1] : tmp[0];
			name = '';

			if (ctrl  === true) name += 'ctrl-';
			if (alt   === true) name += 'alt-';
			if (shift === true) name += 'shift-';

			name += tmp[0];


		// 3b. Check for normal characters
		} else if (_KEYMAP[code] !== undefined) {

			key  = _KEYMAP[code];
			name = '';

			if (ctrl  === true && key !== 'ctrl')  name += 'ctrl-';
			if (alt   === true && key !== 'alt')   name += 'alt-';
			if (shift === true && key !== 'shift') name += 'shift-';


			if (shift === true && key !== 'ctrl' && key !== 'alt' && key !== 'shift') {

				tmp = String.fromCharCode(code);
				key = tmp.trim() !== '' ? tmp : key;

			}


			name += key.toLowerCase();

		}


		let handled = false;

		if (key !== null) {

			// bind('key') and bind('ctrl-a');
			// bind('!')   and bind('shift-1');

			handled = this.trigger('key', [ key, name, delta ]) || handled;
			handled = this.trigger(name,  [ delta ])            || handled;

		}


		this.__clock.key = Date.now();


		return handled;

	};

	const _process_scroll = function(id, x, y, dx, dy) {

		if (this.scroll === false) return false;


		let direction = null;
		let position  = { x: x, y: y };


		// XXX: Natural scrolling behaviour
		if (Math.abs(dx) > Math.abs(dy)) {
			direction = dx < 0 ? 'right' : 'left';
		} else {
			direction = dy < 0 ? 'down'  : 'up';
		}


		// 1. Only fire after the enforced delay
		let delta = Date.now() - this.__clock.scroll;
		if (delta < this.delay) {
			return true;
		}


		let handled = false;

		if (direction !== null) {

			handled = this.trigger('scroll', [ id, direction, position, delta ]) || handled;

		}


		this.__clock.scroll = Date.now();


		return handled;

	};

	let _process_swipe = function(id, state, x, y) {

		if (this.swipe === false) return false;


		// 1. Only fire after the enforced delay
		let delta = Date.now() - this.__clock.swipe;
		if (delta < this.delay) {
			return true;
		}


		let position = { x: x, y: y };
		let swipe    = { x: 0, y: 0 };

		if (this.__swipes[id] !== null) {

			// FIX for touchend events
			if (state === 'end' && x === 0 && y === 0) {
				position.x = this.__swipes[id].x;
				position.y = this.__swipes[id].y;
			}

			swipe.x = x - this.__swipes[id].x;
			swipe.y = y - this.__swipes[id].y;

		}


		let handled = false;


		if (state === 'start') {

			handled = this.trigger(
				'swipe',
				[ id, 'start', position, delta, swipe ]
			) || handled;

			this.__swipes[id] = {
				x: x, y: y
			};

		} else if (state === 'move') {

			handled = this.trigger(
				'swipe',
				[ id, 'move', position, delta, swipe ]
			) || handled;

		} else if (state === 'end') {

			handled = this.trigger(
				'swipe',
				[ id, 'end', position, delta, swipe ]
			) || handled;

			this.__swipes[id] = null;

		}


		this.__clock.swipe = Date.now();


		return handled;

	};

	const _process_touch = function(id, x, y) {

		if (this.touch === false && this.swipe === true) {

			if (this.__swipes[id] === null) {
				_process_swipe.call(this, id, 'start', x, y);
			}

			return true;

		} else if (this.touch === false) {

			return false;

		}


		// 1. Only fire after the enforced delay
		let delta = Date.now() - this.__clock.touch;
		if (delta < this.delay) {
			return true;
		}


		let handled = false;

		handled = this.trigger('touch', [ id, { x: x, y: y }, delta ]) || handled;


		this.__clock.touch = Date.now();


		// 2. Fire Swipe Start, but only for tracked touches
		if (this.__swipes[id] === null) {
			handled = _process_swipe.call(this, id, 'start', x, y) || handled;
		}


		return handled;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.delay       = 0;
		this.key         = false;
		this.keymodifier = false;
		this.touch       = false;
		this.scroll      = false;
		this.swipe       = false;

		this.__clock   = {
			key:    Date.now(),
			scroll: Date.now(),
			swipe:  Date.now(),
			touch:  Date.now()
		};
		this.__swipes  = {
			0: null, 1: null,
			2: null, 3: null,
			4: null, 5: null,
			6: null, 7: null,
			8: null, 9: null
		};


		this.setDelay(settings.delay);
		this.setKey(settings.key);
		this.setKeyModifier(settings.keymodifier);
		this.setScroll(settings.scroll);
		this.setSwipe(settings.swipe);
		this.setTouch(settings.touch);


		_Emitter.call(this);

		_INSTANCES.push(this);

		settings = null;

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

			let settings = {};


			if (this.delay !== 0)           settings.delay       = this.delay;
			if (this.key !== false)         settings.key         = this.key;
			if (this.keymodifier !== false) settings.keymodifier = this.keymodifier;
			if (this.touch !== false)       settings.touch       = this.touch;
			if (this.swipe !== false)       settings.swipe       = this.swipe;


			data['arguments'][0] = settings;


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

			if (key === true || key === false) {

				this.key = key;

				return true;

			}


			return false;

		},

		setKeyModifier: function(keymodifier) {

			if (keymodifier === true || keymodifier === false) {

				this.keymodifier = keymodifier;

				return true;

			}


			return false;

		},

		setTouch: function(touch) {

			if (touch === true || touch === false) {

				this.touch = touch;

				return true;

			}


			return false;

		},

		setScroll: function(scroll) {

			if (scroll === true || scroll === false) {

				this.scroll = scroll;

				return true;

			}


			return false;

		},

		setSwipe: function(swipe) {

			if (swipe === true || swipe === false) {

				this.swipe = swipe;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

