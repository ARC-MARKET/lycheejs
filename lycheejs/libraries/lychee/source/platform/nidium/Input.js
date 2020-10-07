
lychee.define('lychee.Input').tags({
	platform: 'nidium'
}).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (
		typeof global.window === 'object'
		&& typeof global.window.addEventListener === 'function'
		&& typeof global.window.__nidium__ === 'object'
	) {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	const _Emitter   = lychee.import('lychee.event.Emitter');
	const _INSTANCES = [];
	const _window    = global.window;



	/*
	 * EVENTS
	 */

	let _mouseactive = false;

	const _listeners = {

		keydown: function(event) {

			let handled = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				handled = _process_key.call(_INSTANCES[i], event.keyCode, event.ctrlKey, event.altKey, event.shiftKey) || handled;
			}

		},

		mousedown: function(event) {

			_mouseactive = true;


			let handled = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				handled = _process_touch.call(_INSTANCES[i], 0, event.x, event.y) || handled;
			}

		},

		mousemove: function(event) {

			if (_mouseactive === false) {
				return;
			}


			let handled = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				handled = _process_swipe.call(_INSTANCES[i], 0, 'move', event.x, event.y) || handled;
			}

		},

		mouseup: function(event) {

			if (_mouseactive === false) return;

			_mouseactive = false;

			for (let i = 0, l = _INSTANCES.length; i < l; i++) {
				_process_swipe.call(_INSTANCES[i], 0, 'end', event.x, event.y);
			}

		}

	};



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		let keyboard = true;
		let mouse    = true;


		if (typeof global.addEventListener === 'function') {

			if (keyboard) {
				_window._onkeydown = _listeners.keydown;
			}

			if (mouse) {

				_window._onmousedown = _listeners.mousedown;
				_window._onmousemove = _listeners.mousemove;
				_window._onmouseup   = _listeners.mouseup;

			}

		}


		if (lychee.debug === true) {

			let methods = [];

			if (keyboard) methods.push('Keyboard');
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
		// 20:  'capslock',

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

		// 45:  'insert', // XXX: nidium fires incorrect 73
		// 46:  'delete', // XXX: nidium fires incorrect 127

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
		111: '/'

		// 112: 'f1',  // XXX: nidium fires incorrect 58
		// 113: 'f2',  // XXX: nidium fires incorrect 59
		// 114: 'f3',  // XXX: nidium fires incorrect 60
		// 115: 'f4',  // XXX: nidium fires incorrect 187
		// 116: 'f5',  // XXX: nidium fires incorrect 62
		// 117: 'f6',  // XXX: nidium fires incorrect 63
		// 118: 'f7',  // XXX: nidium fires incorrect 64
		// 119: 'f8',  // XXX: nidium fires incorrect 65
		// 120: 'f9',  // XXX: nidium fires incorrect 66
		// 121: 'f10', // XXX: nidium fires incorrect 67
		// 122: 'f11', // XXX: nidium fires incorrect 68
		// 123: 'f12'  // XXX: nidium fires incorrect 69

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
		// 57:  [ '9', '(' ], // XXX: nidium fires incorrect 20


		// 186: [ ';', ':' ], // XXX: nidium fires incorrect 59
		187: [ '=', '+' ],
		188: [ ',', '<' ],
		189: [ '-', '_' ]
		// 190: [ '.', '>' ], // XXX: nidium fires incorrect 46
		// 191: [ '/', '?' ], // XXX: nidium fires incorrect 47
		// 192: [ '`', '~' ], // XXX: nidium fires incorrect 96

		// 219: [ '[',  '{' ], // XXX: nidium fires incirrect 91
		// 220: [ '\\', '|' ], // XXX: nidium fires incorrect 92
		// 221: [ ']',  '}' ], // XXX: nidium fires incorrect 93
		// 222: [ '\'', '"' ]  // XXX: nidium fires incorrect 39

	};

	const _process_key = function(code, ctrl, alt, shift) {

		if (this.key === false) {
			return false;
		}


		ctrl  =  ctrl === true;
		alt   =   alt === true;
		shift = shift === true;


		console.log(code, _KEYMAP[code], _SPECIALMAP[code]);

		if (_KEYMAP[code] === undefined && _SPECIALMAP[code] === undefined) {

			return false;

		} else if (this.keymodifier === false) {

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


		let key     = null;
		let name    = null;
		let tmp     = null;
		let handled = false;
		let delta   = Date.now() - this.__clock.key;

		if (delta < this.delay) {
			return true;
		} else {
			this.__clock.key = Date.now();
		}


		// 0. Computation of Special Characters
		if (_SPECIALMAP[code] !== undefined) {

			tmp  = _SPECIALMAP[code];
			key  = shift === true ? tmp[1] : tmp[0];
			name = '';

			if (ctrl  === true) name += 'ctrl-';
			if (alt   === true) name += 'alt-';
			if (shift === true) name += 'shift-';

			name += tmp[0];

			// 0. Computation of Normal Characters
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


		// 1. Event API
		if (key !== null) {

			// bind('key') and bind('ctrl-a');
			// bind('!')   and bind('shift-1');

			handled = this.trigger('key', [ key, name, delta ]) || handled;
			handled = this.trigger(name,  [ delta ])            || handled;

		}


		return handled;

	};

	const _process_swipe = function(id, state, x, y) {

		if (this.swipe === false) {
			return false;
		}


		let position = { x: x, y: y };
		let swipe    = { x: 0, y: 0 };
		let handled  = false;
		let delta    = Date.now() - this.__clock.swipe;

		if (delta < this.delay) {
			return true;
		} else {
			this.__clock.swipe = Date.now();
		}


		// 0. Computation of Swipe
		if (this.__swipes[id] !== null) {

			// FIX for touchend events
			if (state === 'end' && x === 0 && y === 0) {
				position.x = this.__swipes[id].x;
				position.y = this.__swipes[id].y;
			}

			swipe.x = x - this.__swipes[id].x;
			swipe.y = y - this.__swipes[id].y;

		}


		// 1. Event API
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


		let position = { x: x, y: y };
		let handled  = false;
		let delta    = Date.now() - this.__clock.touch;

		if (delta < this.delay) {
			return true;
		} else {
			this.__clock.touch = Date.now();
		}


		// 1. Event API
		handled = this.trigger('touch', [ id, position, delta ]) || handled;


		// 1. Event API: Swipe only for tracked Touches
		if (this.__swipes[id] === null) {
			handled = _process_swipe.call(this, id, 'start', x, y) || handled;
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
		this.scroll      = false;
		this.swipe       = false;

		this.__clock   = {
			key:    Date.now(),
			scroll: Date.now(),
			swipe:  Date.now(),
			touch:  Date.now()
		};
		this.__swipes  = {
			0: null
		};


		this.setDelay(states.delay);
		this.setKey(states.key);
		this.setKeyModifier(states.keymodifier);
		this.setScroll(states.scroll);
		this.setSwipe(states.swipe);
		this.setTouch(states.touch);


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

				this.touch = touch;

				return true;

			}


			return false;

		},

		setScroll: function(scroll) {

			scroll = typeof scroll === 'boolean' ? scroll : null;


			if (scroll !== null) {

				// XXX: Nidium has not (yet) scroll support

			}


			return false;

		},

		setSwipe: function(swipe) {

			swipe = typeof swipe === 'boolean' ? swipe : null;


			if (swipe !== null) {

				this.swipe = swipe;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

