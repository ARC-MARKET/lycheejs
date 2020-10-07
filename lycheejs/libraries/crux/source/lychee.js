
lychee = (function(global) {

	if (typeof lychee !== 'undefined') {
		return lychee;
	}



	const _BLOBOF_CACHE      = {};
	const _INTERFACEOF_CACHE = {};



	/*
	 * POLYFILLS
	 */

	if (typeof Array.from !== 'function') {

		Array.from = function(alike/*, predicate, thisArg */) {

			if (alike === null || alike === undefined) {
				throw new TypeError('Array.from requires an array-like object - not null or undefined');
			}


			let construct = this;
			let list      = Object(alike);
			let predicate = arguments.length > 1 ? arguments[1] : void 0;
			let thisArg   = arguments.length > 2 ? arguments[2] : void 0;

			if (typeof predicate !== 'undefined') {

				if (typeof predicate !== 'function') {
					throw new TypeError('Array.from: when provided, the second argument must be a function');
				}

			}

			let length = list.length >>> 0;
			let array  = typeof construct === 'function' ? Object(new construct(length)) : new Array(length);

			for (let i = 0; i < length; i++) {

				let value = list[i];

				if (predicate !== undefined) {

					if (thisArg === undefined) {
						array[i] = predicate(value, i);
					} else {
						array[i] = predicate.call(thisArg, value, i);
					}

				} else {
					array[i] = value;
				}

			}

			array.length = length;

			return array;

		};

	}

	if (typeof Array.prototype.find !== 'function') {

		Array.prototype.find = function(predicate/*, thisArg */) {

			if (this === null || this === undefined) {
				throw new TypeError('Array.prototype.find called on null or undefined');
			}

			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}


			let list    = Object(this);
			let length  = list.length >>> 0;
			let thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			let value;

			for (let i = 0; i < length; i++) {

				if (i in list) {

					value = list[i];

					if (predicate.call(thisArg, value, i, list)) {
						return value;
					}

				}

			}


			return undefined;

		};

	}

	if (typeof Array.prototype.includes !== 'function') {

		Array.prototype.includes = function(search/*, from */) {

			if (this === null || this === undefined) {
				throw new TypeError('Array.prototype.includes called on null or undefined');
			}


			let list   = Object(this);
			let length = list.length >>> 0;
			let from   = arguments.length >= 2 ? arguments[1] : 0;
			let value;


			if (length === 0 || from >= length) {
				return false;
			}


			let start = Math.max(from >= 0 ? from : (length - Math.abs(from)), 0);

			for (let i = start; i < length; i++) {

				if (i in list) {

					value = list[i];

					if (value === search || (isNaN(value) && isNaN(search))) {
						return true;
					}

				}

			}


			return false;

		};

	}

	if (typeof Array.prototype.unique !== 'function') {

		Array.prototype.unique = function() {

			if (this === null || this === undefined) {
				throw new TypeError('Array.prototype.unique called on null or undefined');
			}


			let clone  = [];
			let list   = Object(this);
			let length = this.length >>> 0;
			let value;

			for (let i = 0; i < length; i++) {

				value = list[i];

				if (clone.indexOf(value) === -1) {
					clone.push(value);
				}
			}

			return clone;

		};

	}

	if (typeof Boolean.prototype.toJSON !== 'function') {

		Boolean.prototype.toJSON = function() {
			return this.valueOf();
		};

	}

	if (typeof Date.prototype.toJSON !== 'function') {

		let _format_date = function(n) {
			return n < 10 ? '0' + n : '' + n;
		};

		Date.prototype.toJSON = function() {

			if (isFinite(this.valueOf()) === true) {

				let str = '';

				str += this.getUTCFullYear()                + '-';
				str += _format_date(this.getUTCMonth() + 1) + '-';
				str += _format_date(this.getUTCDate())      + 'T';
				str += _format_date(this.getUTCHours())     + ':';
				str += _format_date(this.getUTCMinutes())   + ':';
				str += _format_date(this.getUTCSeconds())   + 'Z';

				return str;

			}


			return null;

		};

	}

	if (typeof Number.prototype.toJSON !== 'function') {

		Number.prototype.toJSON = function() {
			return this.valueOf();
		};

	}

	if (typeof Object.assign !== 'function') {

		Object.assign = function(object /*, ... sources */) {

			if (object !== Object(object)) {
				throw new TypeError('Object.assign called on a non-object');
			}


			for (let a = 1, al = arguments.length; a < al; a++) {

				let source = arguments[a];
				if (source !== undefined && source !== null) {

					for (let key in source) {

						if (Object.prototype.hasOwnProperty.call(source, key) === true) {
							object[key] = source[key];
						}

					}

				}

			}


			return object;

		};

	}

	if (typeof Object.entries !== 'function') {

		Object.entries = function(object) {

			if (object !== Object(object)) {
				throw new TypeError('Object.entries called on a non-object');
			}


			let values = [];

			for (let prop in object) {

				if (Object.prototype.hasOwnProperty.call(object, prop)) {
					values.push([ prop, object[prop] ]);
				}

			}

			return values;

		};

	}

	if (typeof Object.filter !== 'function') {

		Object.filter = function(object, predicate/*, thisArg */) {

			if (object !== Object(object)) {
				throw new TypeError('Object.filter called on a non-object');
			}

			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}


			let props   = [];
			let values  = [];
			let thisArg = arguments.length >= 3 ? arguments[2] : void 0;

			for (let prop in object) {

				let value = object[prop];

				if (Object.prototype.hasOwnProperty.call(object, prop)) {

					if (predicate.call(thisArg, value, prop, object)) {
						props.push(prop);
						values.push(value);
					}

				}

			}


			let filtered = {};

			for (let i = 0; i < props.length; i++) {
				filtered[props[i]] = values[i];
			}

			return filtered;

		};

	}

	if (typeof Object.find !== 'function') {

		Object.find = function(object, predicate/*, thisArg */) {

			if (object !== Object(object)) {
				throw new TypeError('Object.find called on a non-object');
			}

			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}


			let thisArg = arguments.length >= 3 ? arguments[2] : void 0;

			for (let prop in object) {

				let value = object[prop];

				if (Object.prototype.hasOwnProperty.call(object, prop)) {

					if (predicate.call(thisArg, value, prop, object)) {
						return value;
					}

				}

			}

			return undefined;

		};

	}

	if (typeof Object.map !== 'function') {

		Object.map = function(object, predicate/*, thisArg */) {

			if (object !== Object(object)) {
				throw new TypeError('Object.map called on a non-object');
			}

			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}


			let clone   = {};
			let keys    = Object.keys(object).sort();
			let length  = keys.length >>> 0;
			let thisArg = arguments.length >= 3 ? arguments[2] : void 0;
			let key;
			let value;
			let tmp;


			for (let k = 0; k < length; k++) {

				key   = keys[k];
				value = object[key];
				tmp   = predicate.call(thisArg, value, key);

				if (tmp !== undefined) {
					clone[key] = tmp;
				}

			}


			return clone;

		};

	}

	if (typeof Object.sort !== 'function') {

		Object.sort = function(object) {

			if (object !== Object(object)) {
				throw new TypeError('Object.sort called on a non-object');
			}


			let clone  = {};
			let keys   = Object.keys(object).sort();
			let length = keys.length >>> 0;
			let key;
			let value;

			for (let k = 0; k < length; k++) {

				key   = keys[k];
				value = object[key];

				if (value instanceof Array) {

					clone[key] = value.map(element => {

						if (element instanceof Array) {
							return element;
						} else if (element instanceof Object) {
							return Object.sort(element);
						} else {
							return element;
						}

					});

				} else if (value instanceof Object) {

					clone[key] = Object.sort(value);

				} else {

					clone[key] = value;

				}

			}

			return clone;

		};

	}

	if (typeof Object.values !== 'function') {

		Object.values = function(object) {

			if (object !== Object(object)) {
				throw new TypeError('Object.values called on a non-object');
			}


			let values = [];

			for (let prop in object) {

				if (Object.prototype.hasOwnProperty.call(object, prop)) {
					values.push(object[prop]);
				}

			}

			return values;

		};

	}

	if (typeof String.prototype.endsWith !== 'function') {

		String.prototype.endsWith = function(search/*, from */) {

			if (this === null || this === undefined) {
				throw new TypeError('String.prototype.endsWith called on null or undefined');
			}


			let value  = (this).toString();
			let from   = arguments.length >= 2 ? (arguments[1] | 0) : value.length;
			let tmp    = String(search);
			let length = tmp.length >>> 0;


			let chunk = value.substr(from - length);
			if (chunk === tmp) {
				return true;
			}


			return false;

		};

	}

	if (typeof String.prototype.includes !== 'function') {

		String.prototype.includes = function(search/*, from */) {

			if (this === null || this === undefined) {
				throw new TypeError('String.prototype.includes called on null or undefined');
			}


			let value  = String(this);
			let from   = arguments.length >= 2 ? (arguments[1] | 0) : 0;
			let tmp    = String(search);
			let length = tmp.length >>> 0;

			if (from + length > value.length) {
				return false;
			}


			return value.indexOf(search, from) !== -1;

		};

	}

	if (typeof String.prototype.replaceObject !== 'function') {

		String.prototype.replaceObject = function(object) {

			if (object !== Object(object)) {
				throw new TypeError('String.prototype.replaceObject called on a non-object');
			}


			let clone  = '' + this;
			let keys   = Object.keys(object);
			let values = Object.values(object);


			for (let k = 0, kl = keys.length; k < kl; k++) {

				let key   = keys[k];
				let value = values[k];

				if (value instanceof Array) {
					value = JSON.stringify(value, null, '\t');
				} else if (value instanceof Object) {
					value = JSON.stringify(value, null, '\t');
				} else if (typeof value !== 'string') {
					value = '' + value;
				}


				let pointers = [];
				let pointer  = clone.indexOf('${' + key + '}');

				while (pointer !== -1) {
					pointers.push(pointer);
					pointer = clone.indexOf('${' + key + '}', pointer + 1);
				}


				let offset = 0;

				for (let p = 0, pl = pointers.length; p < pl; p++) {

					let index = pointers[p];

					clone   = clone.substr(0, index + offset) + value + clone.substr(index + offset + key.length + 3);
					offset += (value.length - (key.length + 3));

				}

			}


			return clone;

		};

	}

	if (typeof String.prototype.startsWith !== 'function') {

		String.prototype.startsWith = function(search/*, from */) {

			if (this === null || this === undefined) {
				throw new TypeError('String.prototype.startsWith called on null or undefined');
			}


			let value  = (this).toString();
			let from   = arguments.length >= 2 ? (arguments[1] | 0) : 0;
			let tmp    = String(search);
			let length = tmp.length >>> 0;


			let chunk = value.substr(from, length);
			if (chunk === tmp) {
				return true;
			}


			return false;

		};

	}

	if (typeof String.prototype.toJSON !== 'function') {

		String.prototype.toJSON = function() {
			return this.valueOf();
		};

	}



	/*
	 * HELPERS
	 */

	let _environment = null;
	let _simulation  = null;

	const _CRUX_CORE = [
		'assignsafe',
		'assignunlink',
		'blobof',
		'decycle',
		'diff',
		'enumof',
		'interfaceof',
		'deserialize',
		'serialize',
		'assimilate',
		'define',
		// XXX: export/import disabled
		// 'export',
		// 'import',
		'init',
		'inject',
		'pkg',
		'specify',
		'setEnvironment',
		'setSimulation'
	];

	const _CRUX_DEFINITIONS = [
		'Asset',
		'Debugger',
		'Definition',
		'Environment',
		'Package',
		'Simulation',
		'Specification'
	];

	const _bootstrap_environment = function() {

		if (_environment === null) {

			_environment = new lychee.Environment({
				debug: false
			});

		}


		if (this.environment === null) {
			this.setEnvironment(_environment);
		}

	};

	const _bootstrap_sandbox = function() {

		if (this.lychee instanceof Object) {

			if (typeof this.lychee['import'] === 'function') {
				return;
			}

		}


		this.Buffer  = global.Buffer;
		this.Config  = global.Config;
		this.Font    = global.Font;
		this.Music   = global.Music;
		this.Sound   = global.Sound;
		this.Texture = global.Texture;


		this.lychee              = {};
		this.lychee.debug        = global.lychee.debug;
		this.lychee.environment  = null;
		this.lychee.simulation   = null;
		this.lychee.ENVIRONMENTS = global.lychee.ENVIRONMENTS;
		this.lychee.FEATURES     = global.lychee.FEATURES;
		this.lychee.FILENAME     = global.lychee.FILENAME;
		this.lychee.PLATFORMS    = global.lychee.PLATFORMS;
		this.lychee.SIMULATIONS  = global.lychee.SIMULATIONS;
		this.lychee.ROOT         = {};
		this.lychee.ROOT.lychee  = global.lychee.ROOT.lychee;
		this.lychee.ROOT.project = global.lychee.ROOT.project;
		this.lychee.VERSION      = global.lychee.VERSION;


		let scope = this;

		this.lychee.import = function(reference) {

			reference = typeof reference === 'string' ? reference : null;


			if (reference !== null) {

				let instance = null;

				let resolved_module = _resolve_reference.call(scope, reference);
				if (resolved_module !== null) {
					instance = resolved_module;
				}


				if (instance === null) {
					console.info('lychee.import: Assimilate "' + reference + '" to import it.');
				}


				return instance;

			} else {

				console.warn('lychee.import: Invalid reference.');
				console.info('lychee.import: Use lychee.import(reference).');
				console.info('lychee.import: reference is a Definition identifier.');

			}


			return null;

		};


		_CRUX_CORE.forEach(identifier => {
			this.lychee[identifier] = global.lychee[identifier];
		});

		_CRUX_DEFINITIONS.forEach(identifier => {
			this.lychee[identifier] = global.lychee[identifier];
		});


		this.setTimeout = function(callback, timeout) {
			global.setTimeout(callback, timeout);
		};

		this.setInterval = function(callback, interval) {
			global.setInterval(callback, interval);
		};

	};

	const _bootstrap_simulation = function() {

		_bootstrap_environment.call(this);


		if (_simulation === null) {

			_simulation = new lychee.Simulation({
				environment: this.environment
			});

		}


		if (this.simulation === null) {
			this.setSimulation(_simulation);
		}

	};

	const _validate_environment = function(environment) {

		if (environment instanceof lychee.Environment) {
			return true;
		} else if (environment instanceof lychee.Simulation) {
			return true;
		}


		return false;

	};

	const _resolve_reference = function(identifier) {

		let pointer = this;

		let ns = identifier.split('.');
		for (let n = 0, l = ns.length; n < l; n++) {

			let name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}

		return pointer;

	};

	const _decycle = function(target, object, path) {

		let check = this.has(object);
		if (check === false) {

			this.set(object, path);

			for (let prop in object) {

				if (object.hasOwnProperty(prop) === true) {

					let ovalue = object[prop];
					if (ovalue instanceof Array) {

						target[prop] = [];

						let ref = _decycle.call(this, target[prop], object[prop], path + '.' + prop);
						if (ref !== null) {
							target[prop] = ref;
						}

					} else if (ovalue instanceof Object) {

						target[prop] = {};

						let ref = _decycle.call(this, target[prop], object[prop], path + '.' + prop);
						if (ref !== null) {
							target[prop] = ref;
						}

					} else {

						target[prop] = object[prop];

					}

				}

			}

			return null;

		} else {

			return {
				'reference': this.get(object),
				'arguments': []
			};

		}

	};

	const _fix_export = function(line) {

		let indent = line.substr(0, line.indexOf(line.trim()));
		let chunk  = line.trim();
		if (chunk.startsWith('export ')) {

			let check = chunk.split(' ');
			if (check[0] === 'export') {

				if (check[1] === 'default') {
					return indent + 'SANDBOX = SANDBOX[\'default\'] = ' + check.slice(2).join(' ');
				} else if (check[1] === '{') {
					return indent + 'SANDBOX = ' + check.slice(1).join(' ');
				} else if (check[1] === 'function') {

					let name = check[2].substr(0, check[2].indexOf('(')).trim();
					if (name !== '') {
						return indent + 'SANDBOX[\'' + name + '\'] = ' + check.slice(1).join(' ');
					}

				} else if ((check[1] === 'const' || check[1] === 'let') && check[3] === '=') {

					let name = check[2].trim();
					if (name !== '') {
						return indent + check[1] + ' ' + name + ' = SANDBOX[\'' + name + '\'] = ' + check.slice(4).join(' ');
					}

				} else if (check[1] === 'class') {

					let name = check[2].trim();
					if (name !== '') {
						return indent + 'SANDBOX[\'' + name + '\'] = ' + check.slice(1).join(' ');
					}

				}

			}

			return indent + line;

		}

		return line;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		debug: true,

		environment: _environment,
		simulation:  _simulation,

		ENVIRONMENTS: {},
		FEATURES:     {},
		FILENAME:     null,
		PLATFORMS:    [],
		SIMULATIONS:  {},

		ROOT: {
			lychee:  '/opt/lycheejs',
			project: null
		},

		VERSION: '2018-Q3',



		/*
		 * LIBRARY API
		 */

		assignsafe: function(target) {

			target = target instanceof Object ? target : {};


			for (let a = 1, al = arguments.length; a < al; a++) {

				let object = arguments[a];
				if (object) {

					for (let prop in object) {

						if (object.hasOwnProperty(prop) === true) {

							let tvalue = target[prop];
							let ovalue = object[prop];
							if (tvalue instanceof Array && ovalue instanceof Array) {

								Module.assignsafe(target[prop], object[prop]);

							} else if (tvalue instanceof Object && ovalue instanceof Object) {

								Module.assignsafe(target[prop], object[prop]);

							} else if (tvalue === null && ovalue !== null) {

								target[prop] = object[prop];

							} else if (typeof tvalue === typeof ovalue) {

								target[prop] = object[prop];

							}

						}

					}

				}

			}


			return target;

		},

		assignunlink: function(target) {

			target = target instanceof Object ? target : {};


			for (let a = 1, al = arguments.length; a < al; a++) {

				let object = arguments[a];
				if (object) {

					for (let prop in object) {

						if (Object.prototype.hasOwnProperty.call(object, prop) === true) {

							let ovalue = object[prop];
							if (ovalue instanceof Array) {

								target[prop] = [];
								Module.assignunlink(target[prop], object[prop]);

							} else if (ovalue instanceof Object) {

								target[prop] = {};
								Module.assignunlink(target[prop], object[prop]);

							} else {

								target[prop] = object[prop];

							}

						}

					}

				}

			}


			return target;

		},

		blobof: function(template, blob) {

			template = template !== undefined ? template : null;
			blob     = blob instanceof Object ? blob     : null;


			if (template !== null && blob !== null) {

				let tname    = template.displayName;
				let bname    = blob.reference || blob.constructor || null;
				let hashable = typeof tname === 'string' && typeof bname === 'string';
				let hashmap  = _BLOBOF_CACHE;


				// 0. Quick validation for identical constructors
				if (hashable === true) {

					if (hashmap[tname] !== undefined && hashmap[tname][bname] !== undefined) {

						return hashmap[tname][bname];

					} else if (tname === bname) {

						if (hashmap[tname] === undefined) {
							hashmap[tname] = {};
						}

						hashmap[tname][bname] = true;

						return hashmap[tname][bname];

					} else if (tname !== bname) {

						let instance = lychee.deserialize(blob);
						if (lychee.interfaceof(template, instance) === true) {

							if (hashmap[tname] === undefined) {
								hashmap[tname] = {};
							}

							hashmap[tname][bname] = true;

							return hashmap[tname][bname];

						}

					}

				}

			}


			return false;

		},

		decycle: function(target, object, path) {

			target = target instanceof Object ? target : {};
			object = object instanceof Object ? object : null;
			path   = typeof path === 'string' ? path   : '';


			if (object !== null) {
				_decycle.call(new WeakMap(), target, object, path);
			}

			return target;

		},

		diff: function(aobject, bobject) {

			aobject = aobject !== undefined ? aobject : undefined;
			bobject = bobject !== undefined ? bobject : undefined;


			if (aobject === bobject) {

				return false;

			} else if (aobject instanceof Array && bobject instanceof Array) {

				for (let a = 0, al = aobject.length; a < al; a++) {

					if (bobject[a] !== undefined) {

						if (aobject[a] !== null && bobject[a] !== null) {

							if (aobject[a] instanceof Object && bobject[a] instanceof Object) {

								if (Module.diff(aobject[a], bobject[a]) === true) {

									// Allows aobject[a].builds = {} and bobject[a].builds = { stuff: {}}
									if (Object.keys(aobject[a]).length > 0) {
										return true;
									}

								}

							} else if (typeof aobject[a] !== typeof bobject[a]) {
								return true;
							} else if (aobject[a] !== bobject[a]) {
								return true;
							}

						}

					} else {
						return true;
					}

				}

			} else if (aobject instanceof Date && bobject instanceof Date) {

				let astr = aobject.toString();
				let bstr = bobject.toString();

				if (astr !== bstr) {
					return true;
				}

			} else if (aobject instanceof RegExp && bobject instanceof RegExp) {

				let astr = aobject.toString();
				let bstr = bobject.toString();

				if (astr !== bstr) {
					return true;
				}

			} else if (aobject instanceof Object && bobject instanceof Object) {

				let akeys = Object.keys(aobject);
				let bkeys = Object.keys(bobject);

				if (akeys.length !== bkeys.length) {
					return true;
				}


				for (let a = 0, al = akeys.length; a < al; a++) {

					let key = akeys[a];

					if (bobject[key] !== undefined) {

						if (aobject[key] !== null && bobject[key] !== null) {

							if (aobject[key] instanceof Object && bobject[key] instanceof Object) {

								if (Module.diff(aobject[key], bobject[key]) === true) {

									// Allows aobject[key].builds = {} and bobject[key].builds = { stuff: {}}
									if (Object.keys(aobject[key]).length > 0) {
										return true;
									}

								}

							} else if (typeof aobject[key] !== typeof bobject[key]) {
								return true;
							} else if (aobject[key] !== bobject[key]) {
								return true;
							}

						}

					} else {
						return true;
					}

				}

			} else if (aobject !== bobject) {

				return true;

			}


			return false;

		},

		enumof: function(template, value) {

			template = template instanceof Object ? template : null;
			value    = typeof value === 'number'  ? value    : null;


			if (template !== null && value !== null) {

				let valid = false;

				for (let val in template) {

					if (value === template[val]) {
						valid = true;
						break;
					}

				}

				return valid;

			}


			return false;

		},

		interfaceof: function(template, instance) {

			template = template !== undefined ? template : null;
			instance = instance !== undefined ? instance : null;


			if (template !== null && instance !== null) {

				let tname    = template.displayName;
				let iname    = instance.displayName;
				let hashable = typeof tname === 'string' && typeof iname === 'string';
				let hashmap  = _INTERFACEOF_CACHE;
				let valid    = false;


				// 0. Quick validation for identical constructors
				if (hashable === true) {

					if (hashmap[tname] !== undefined && hashmap[tname][iname] !== undefined) {

						return hashmap[tname][iname];

					} else if (tname === iname) {

						if (hashmap[tname] === undefined) {
							hashmap[tname] = {};
						}

						hashmap[tname][iname] = true;

						return hashmap[tname][iname];

					}

				}


				// 1. Interface validation on Template
				if (template instanceof Function && template.prototype instanceof Object && instance instanceof Function && instance.prototype instanceof Object) {

					valid = true;

					for (let method in template.prototype) {

						if (typeof template.prototype[method] !== typeof instance.prototype[method]) {
							valid = false;
							break;
						}

					}


				// 2. Interface validation on Instance
				} else if (template instanceof Function && template.prototype instanceof Object && instance instanceof Object) {

					valid = true;

					for (let method in template.prototype) {

						if (typeof template.prototype[method] !== typeof instance[method]) {
							valid = false;
							break;
						}

					}


				// 3. Interface validation on Struct
				} else if (template instanceof Object && instance instanceof Object) {

					valid = true;

					for (let property in template) {

						if (template.hasOwnProperty(property) && instance.hasOwnProperty(property)) {

							if (typeof template[property] !== typeof instance[property]) {
								valid = false;
								break;
							}

						}

					}

				}


				if (hashable === true) {

					if (hashmap[tname] === undefined) {
						hashmap[tname] = {};
					}

					hashmap[tname][iname] = valid;

				}


				return valid;

			}


			return false;

		},



		/*
		 * ENTITY API
		 */

		deserialize: function(data) {

			data = data instanceof Object ? data : null;


			try {
				data = JSON.parse(JSON.stringify(data));
			} catch (err) {
				data = null;
			}


			if (data !== null) {

				let instance = null;
				let scope    = (this.environment !== null ? this.environment.global : global);


				if (typeof data.reference === 'string') {

					let resolved_module = _resolve_reference.call(scope, data.reference);
					if (typeof resolved_module === 'object') {
						instance = resolved_module;
					}

				} else if (typeof data.constructor === 'string' && data.arguments instanceof Array) {

					let resolved_composite = _resolve_reference.call(scope, data.constructor);
					if (typeof resolved_composite === 'function') {

						let bindargs = Array.from(data.arguments).map(value => {

							if (typeof value === 'string' && value.charAt(0) === '#') {

								if (lychee.debug === true) {
									console.log('lychee.deserialize: Injecting "' + value + '" from global');
								}

								let resolved = _resolve_reference.call(scope, value.substr(1));
								if (resolved !== null) {
									value = resolved;
								}

							}

							return value;

						});


						bindargs.reverse();
						bindargs.push(resolved_composite);
						bindargs.reverse();


						instance = new (
							resolved_composite.bind.apply(
								resolved_composite,
								bindargs
							)
						)();

					}

				} else if (data instanceof Object) {

					instance = data;

				}


				if (instance !== null) {

					// High-Level ENTITY API
					if (typeof instance.deserialize === 'function') {

						let blob = data.blob || null;
						if (blob !== null) {
							instance.deserialize(blob);
						}

					// Low-Level ASSET API
					} else if (typeof instance.load === 'function') {
						instance.load();
					}


					return instance;

				} else {

					console.info('lychee.deserialize: Require ' + (data.reference || data.constructor) + ' to deserialize it.');

				}

			}


			return null;

		},

		serialize: function(definition) {

			definition = definition !== undefined ? definition : null;


			let data = null;

			if (definition !== null) {

				if (typeof definition === 'object') {

					if (typeof definition.serialize === 'function') {

						data = definition.serialize();

					} else if (typeof definition.displayName !== 'undefined') {

						if (definition.prototype instanceof Object) {
							console.info('lychee.serialize: Define ' + (definition.displayName) + '.prototype.serialize() to serialize it.');
						} else {
							console.info('lychee.serialize: Define ' + (definition.displayName) + '.serialize() to serialize it.');
						}

					} else {

						try {
							data = JSON.parse(JSON.stringify(definition));
						} catch (err) {
							data = null;
						}

					}

				} else if (typeof definition === 'function') {

					data = definition.toString();

				}

			}


			return data;

		},



		/*
		 * CUSTOM API
		 */

		assimilate: function(target, sandbox) {

			target  = typeof target === 'string' ? target  : null;
			sandbox = sandbox !== undefined      ? sandbox : global;


			if (target !== null) {

				_bootstrap_environment.call(this);


				let asset = new lychee.Asset(target, null, true);
				if (asset !== null) {

					asset.onload = function(result) {

						if (result === true) {

							let code = this.buffer.toString('utf8');
							if (code.trim().length > 0) {

								code = code.split('\n').map(line => _fix_export(line)).join('\n');

								with ({
									SANDBOX: sandbox
								}) {

									try {
										eval(code);
									} catch (err) {
										lychee.Debugger.report(lychee.environment, err, asset);
									}

								}

							}

						} else {
							console.warn('lychee.assimilate: Invalid target.');
							console.info('lychee.assimilate: use lychee.assimilate(target).');
							console.info('lychee.assimilate: target is a URL to an Asset.');
						}

					};

					asset.load();

				}


				return asset;

			} else {

				console.warn('lychee.assimilate: Invalid target.');
				console.info('lychee.assimilate: use lychee.assimilate(target).');
				console.info('lychee.assimilate: target is a URL to an Asset.');

			}


			return null;

		},

		define: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				_bootstrap_environment.call(this);


				let definition = new lychee.Definition({
					id:  identifier,
					url: lychee.FILENAME || null
				});


				let count   = 0;
				let sandbox = this;

				while (count < 64 && sandbox.environment.sandbox === true) {
					sandbox = sandbox.environment.global.lychee;
					count++;
				}

				definition.exports = function(callback) {
					lychee.Definition.prototype.exports.call(this, callback);
					sandbox.environment.define(this, false);
				};


				return definition;

			} else {

				console.warn('lychee.define: Invalid identifier.');
				console.info('lychee.define: Use lychee.define(id).exports(function(lychee, global, attachments) {}).');
				console.info('lychee.define: identifier is a dot-separated notation, e.g. "app.entity.Example".');
				console.info('lychee.define: The "lycheejs-breeder init <identifier>" command may help you.');

			}


			return null;

		},

		export: function(reference, sandbox) {

			reference = typeof reference === 'string' ? reference : null;
			sandbox   = sandbox !== undefined         ? sandbox   : global;


			if (reference !== null && sandbox !== null) {

				_bootstrap_environment.call(this);

				if (sandbox !== global) {
					_bootstrap_sandbox.call(sandbox);
				}


				let definition = this.environment.definitions[reference] || null;
				if (definition !== null) {

					let includes = definition._includes;
					if (includes.length > 0) {

						includes.filter(inc => _resolve_reference.call(sandbox, inc) === null).forEach(ref => {
							Module.export(ref, sandbox);
						});

					}

					let requires = definition._requires;
					if (requires.length > 0) {

						requires.filter(req => _resolve_reference.call(sandbox, req) === null).forEach(ref => {
							Module.export(ref, sandbox);
						});

					}


					let result = definition.export(sandbox);
					if (result === true) {

						let instance = _resolve_reference.call(sandbox, reference);
						if (instance !== null) {
							return instance;
						}

					}

				}

			} else {

				console.warn('lychee.export: Invalid reference.');
				console.info('lychee.export: Use lychee.export(reference, sandbox).');
				console.info('lychee.export: reference is a Definition identifier.');

			}


			return null;

		},

		import: function(reference) {

			reference = typeof reference === 'string' ? reference : null;


			if (reference !== null) {

				_bootstrap_environment.call(this);


				let count    = 0;
				let instance = null;
				let sandbox  = this;

				while (count < 64 && sandbox.environment.sandbox === true) {
					sandbox = sandbox.environment.global.lychee;
					count++;
				}

				let resolved_module = _resolve_reference.call(sandbox.environment.global, reference);
				if (resolved_module !== null) {
					instance = resolved_module;
				}


				if (instance === null) {
					console.info('lychee.import: Require "' + reference + '" to import it.');
				}


				return instance;

			} else {

				console.warn('lychee.import: Invalid reference.');
				console.info('lychee.import: Use lychee.import(reference).');
				console.info('lychee.import: reference is a Definition identifier.');

			}


			return null;

		},

		init: function(environment, settings, callback) {

			let message = environment !== null;

			environment = _validate_environment(environment) === true ? environment : null;
			settings    = settings instanceof Object                  ? settings    : null;
			callback    = callback instanceof Function                ? callback    : null;


			_bootstrap_environment.call(this);
			_bootstrap_simulation.call(this);


			if (environment !== null && settings !== null) {

				if (_environment !== null) {

					if (environment instanceof lychee.Environment) {

						Object.values(_environment.definitions).forEach(definition => {
							environment.define(definition, true);
						});

					} else if (environment instanceof lychee.Simulation) {

						Object.values(_environment.definitions).forEach(definition => {
							environment.environment.define(definition, true);
						});

					}

				}


				if (environment.id.startsWith('lychee-Environment-')) {
					environment.setId((lychee.ROOT.project || '').substr((lychee.ROOT.lychee || '').length) + '/custom');
				}

				for (let id in settings) {

					let method = 'set' + id.charAt(0).toUpperCase() + id.substr(1);
					if (typeof environment[method] === 'function') {
						environment[method](settings[id]);
					}

				}


				if (environment instanceof lychee.Environment) {

					if (callback === null) {

						let code    = '';
						let profile = settings.profile || {};

						code += '\n\n';
						code += 'if (sandbox === null) {\n';
						code += '\tconsole.error(\'lychee: environment.init() failed.\');\n';
						code += '\treturn;\n';
						code += '}\n';
						code += '\n\n';
						code += 'let lychee = sandbox.lychee;\n';

						let packages = environment.packages;
						if (packages instanceof Object && Array.isArray(packages) === false) {

							for (let pid in packages) {

								if (pid !== 'lychee' && /$([a-z]+)/g.test(pid)) {
									code += 'let ' + pid + ' = sandbox.' + pid + ';\n';
								}

							}

						}

						code += '\n\n';
						code += 'sandbox.MAIN = new ' + environment.target + '(' + JSON.stringify(profile) + ');\n';
						code += '\n\n';
						code += 'if (typeof sandbox.MAIN.init === \'function\') {\n';
						code += '\tsandbox.MAIN.init();\n';
						code += '}\n';

						callback = new Function('sandbox', code);

					}


					lychee.setEnvironment(environment);
					environment.init(callback);

				} else if (environment instanceof lychee.Simulation) {

					let simulation = environment;

					environment = simulation.environment;


					if (callback === null) {

						let code = '';

						code += '\n\n';
						code += 'if (sandbox_sim === null) {\n';
						code += '\tconsole.error(\'lychee: simulation.init() failed.\');\n';
						code += '\treturn;\n';
						code += '}\n';
						code += '\n\n';
						code += 'console.info(\'lychee: simulation.init() succeeded.\');\n';

						callback = new Function('sandbox_sim', code);

					}


					lychee.setEnvironment(environment);

					environment.init(sandbox => {

						if (sandbox === null) {
							console.error('lychee: environment.init() failed.');
							return;
						}


						console.info('lychee: environment.init() succeeded.');

						lychee.setSimulation(simulation);
						simulation.init(callback);

					});

				}


				return true;

			} else if (message === true) {

				console.warn('lychee.init: Invalid environment.');
				console.info('lychee.init: Use lychee.init(environment, settings, callback).');
				console.info('lychee.init: environment is either a lychee.Environment or lychee.Simulation instance.');

			}


			return false;

		},

		inject: function(environment) {

			let message = environment !== null;

			environment = environment instanceof lychee.Environment ? environment : null;


			_bootstrap_environment.call(this);


			if (environment !== null) {

				if (this.environment !== null) {

					Object.values(environment.definitions).forEach(definition => {
						this.environment.define(definition, true);
					});

					let build_old = this.environment.definitions[this.environment.target] || null;
					let build_new = environment.definitions[environment.target]           || null;

					if (build_old === null && build_new !== null) {
						this.environment.target = environment.target;
						this.environment.type   = environment.type;
					}


					return true;

				} else {

					console.warn('lychee.inject: Invalid default environment for injection.');
					console.info('lychee.inject: Use lychee.setEnvironment(environment) before using lychee.inject(other).');

				}

			} else if (message === true) {

				console.warn('lychee.inject: Invalid environment.');
				console.info('lychee.inject: Use lychee.inject(environment).');
				console.info('lychee.inject: environment is a lychee.Environment instance.');

			}


			return false;

		},

		pkg: function(type, id, callback) {

			type     = typeof type === 'string'     ? type       : null;
			id       = typeof id === 'string'       ? id         : null;
			callback = callback instanceof Function ? callback   : null;


			if (id !== null && type !== null && callback !== null) {

				if (/^(build|review|source)$/g.test(type)) {

					let config = new Config('./lychee.pkg');

					config.onload = function() {

						let buffer = this.buffer || null;
						if (buffer instanceof Object) {

							let settings = buffer[type].environments[id] || null;
							if (settings instanceof Object) {

								let environment = null;
								let profile     = settings.profile || null;

								if (profile !== null) {
									delete settings.profile;
								}

								if (type === 'build' || type === 'source') {
									environment = new lychee.Environment(JSON.parse(JSON.stringify(settings)));
								} else if (type === 'review') {
									environment = new lychee.Simulation(JSON.parse(JSON.stringify(settings)));
								}

								callback(environment, profile);

							} else {

								console.warn('lychee.pkg: Invalid Settings for "' + id + '" in "' + this.url + '".');
								console.info('lychee.pkg: Verify Settings at "/' + type + '/environments/' + id + '" in lychee.pkg.');

								callback(null, null);

							}

						} else {

							console.warn('lychee.pkg: Invalid Package at "' + this.url + '".');
							console.info('lychee.pkg: Replace lychee.pkg with the one from "/projects/boilerplate".');
							console.info('lychee.pkg: The "lycheejs-harvester start" command may help you.');

							callback(null, null);

						}

					};

					config.load();

					return true;

				}

			}


			return false;

		},

		specify: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				_bootstrap_simulation.call(this);


				let sandbox       = this;
				let specification = new lychee.Specification({
					id:  identifier,
					url: lychee.FILENAME || null
				});

				specification.exports = function(callback) {
					lychee.Specification.prototype.exports.call(this, callback);
					sandbox.simulation.specify(this, false);
				};


				return specification;

			} else {

				console.warn('lychee.specify: Invalid identifier.');
				console.info('lychee.specify: Use lychee.specify(id).exports(function(lychee, sandbox) {}).');
				console.info('lychee.specify: identifier is a dot-separated notation, e.g. "app.entity.Example".');
				console.info('lychee.specify: The "lycheejs-breeder init <identifier>" command may help you.');

			}


			return null;

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;
				this.debug       = this.environment.debug;

				return true;

			} else {

				this.environment = _environment;
				this.debug       = this.environment.debug;

			}


			return false;

		},

		setSimulation: function(simulation) {

			simulation = simulation instanceof lychee.Simulation ? simulation : null;


			if (simulation !== null) {

				this.simulation = simulation;

				return true;

			} else {

				this.simulation = _simulation;

			}


			return false;

		}

	};


	if (typeof lychee === 'undefined') {
		lychee = global.lychee = Object.assign({}, Module);
	}


	return Module;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

