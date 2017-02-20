
lychee = typeof lychee !== 'undefined' ? lychee : (function(global) {

	const _INTERFACEOF_CACHE = {};



	/*
	 * NAMESPACE
	 */

	if (typeof lychee === 'undefined') {
		lychee = global.lychee = {};
	}



	/*
	 * POLYFILLS
	 */

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

					clone[key] = value.map(function(element) {

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
					value = JSON.stringify(value);
				} else if (value instanceof Object) {
					value = JSON.stringify(value);
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

	if (typeof String.prototype.toJSON !== 'function') {

		String.prototype.toJSON = function() {
			return this.valueOf();
		};

	}



	/*
	 * HELPERS
	 */

	let _environment = null;

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



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		debug:        true,
		environment:  _environment,

		ENVIRONMENTS: {},
		ROOT:         {
			lychee:  '/opt/lycheejs',
			project: null
		},
		VERSION:      "2016-Q4",



		/*
		 * LIBRARY API
		 */

		diff: function(aobject, bobject) {

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

							if (lychee.diff(aobject[key], bobject[key]) === true) {

								// Allows aobject[key].builds = {} and bobject[key].builds = { stuff: {}}
								if (Object.keys(aobject[key]).length > 0) {
									return true;
								}

							}

						} else if (typeof aobject[key] !== typeof bobject[key]) {
							return true;
						}

					}

				} else {
					return true;
				}

			}


			return false;

		},

		enumof: function(template, value) {

			if (template instanceof Object && typeof value === 'number') {

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

		assignsafe: function(target) {

			for (let a = 1, al = arguments.length; a < al; a++) {

				let object = arguments[a];
				if (object) {

					for (let prop in object) {

						if (object.hasOwnProperty(prop) === true) {

							let tvalue = target[prop];
							let ovalue = object[prop];
							if (tvalue instanceof Array && ovalue instanceof Array) {

								lychee.assignsafe(target[prop], object[prop]);

							} else if (tvalue instanceof Object && ovalue instanceof Object) {

								lychee.assignsafe(target[prop], object[prop]);

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

			for (let a = 1, al = arguments.length; a < al; a++) {

				let object = arguments[a];
				if (object) {

					for (let prop in object) {

						if (object.hasOwnProperty(prop) === true) {

							let tvalue = target[prop];
							let ovalue = object[prop];
							if (tvalue instanceof Array && ovalue instanceof Array) {
								target[prop] = [];
								lychee.assignunlink(target[prop], object[prop]);
							} else if (tvalue instanceof Object && ovalue instanceof Object) {
								target[prop] = {};
								lychee.assignunlink(target[prop], object[prop]);
							} else {
								target[prop] = object[prop];
							}

						}

					}

				}

			}


			return target;

		},

		interfaceof: function(template, instance) {

			if (instance === null || instance === undefined) {
				return false;
			}


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

					return true;

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

					let resolved_class = _resolve_reference.call(scope, data.constructor);
					if (typeof resolved_class === 'function') {

						let bindargs = [].splice.call(data.arguments, 0).map(function(value) {

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
						bindargs.push(resolved_class);
						bindargs.reverse();


						instance = new (
							resolved_class.bind.apply(
								resolved_class,
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
							console.info('lychee.deserialize: Define ' + (definition.displayName) + '.prototype.serialize() to serialize it.');
						} else {
							console.info('lychee.deserialize: Define ' + (definition.displayName) + '.serialize() to serialize it.');
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

		assimilate: function(target) {

			target = typeof target === 'string' ? target : null;


			if (target !== null) {

				_bootstrap_environment.call(this);


				let that = this;


				// XXX: First sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}

				// XXX: Second sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}

				// XXX: Third sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}


				let asset = new lychee.Asset(target, null, false);
				if (asset !== null) {
					asset.load();
				}


				return asset;

			} else {

				console.warn('lychee.assimilate: Invalid target');
				console.info('lychee.assimilate: Use lychee.assimilate(target) where target is a path to an Asset');

			}


			return null;

		},

		define: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				_bootstrap_environment.call(this);


				let definition = new lychee.Definition(identifier);
				let that       = this;


				// XXX: First sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}

				// XXX: Second sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}

				// XXX: Third sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}


				definition.exports = function(callback) {

					lychee.Definition.prototype.exports.call(this, callback);
					that.environment.define(this);

				};


				return definition;

			} else {

				console.warn('lychee.define: Invalid identifier');
				console.info('lychee.define: Use lychee.define(id).exports(closure)');

			}


			return null;

		},

		import: function(reference) {

			reference = typeof reference === 'string' ? reference : null;


			if (reference !== null) {

				_bootstrap_environment.call(this);


				let instance = null;
				let that     = this;

				// XXX: First sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}

				// XXX: Second sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}

				// XXX: Third sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}


				let resolved_module = _resolve_reference.call(that.environment.global, reference);
				if (resolved_module !== null) {
					instance = resolved_module;
				}


				if (instance === null) {
					console.info('lychee.deserialize: Require ' + (reference) + ' to import it.');
				}


				return instance;

			}


			return null;

		},

		envinit: function(environment, profile) {

			let message = environment !== null;

			environment = environment instanceof lychee.Environment ? environment : null;
			profile     = profile instanceof Object                 ? profile     : {};


			_bootstrap_environment.call(this);


			if (environment !== null) {

				let code        = '\n';
				let id          = (lychee.ROOT.project || '').substr((lychee.ROOT.lychee || '').length) + '/custom';
				let env_profile = Object.assign({}, environment.profile, profile);


				if (environment.id.substr(0, 19) === 'lychee-Environment-') {
					environment.setId(id);
				}


				if (_environment !== null) {

					Object.values(_environment.definitions).forEach(function(definition) {
						environment.define(definition);
					});

				}


				code += '\n\n';
				code += 'if (sandbox === null) {\n';
				code += '\tconsole.error("lychee: envinit() failed.");\n';
				code += '\treturn;\n';
				code += '}\n';
				code += '\n\n';


				code += [ 'lychee' ].concat(environment.packages.map(function(pkg) {
					return pkg.id;
				})).map(function(lib) {
					return 'let ' + lib + ' = sandbox.' + lib + ';';
				}).join('\n');

				code += '\n\n';
				code += 'sandbox.MAIN = new ' + environment.build + '(' + JSON.stringify(env_profile) + ');\n';
				code += '\n\n';
				code += 'if (typeof sandbox.MAIN.init === \'function\') {\n';
				code += '\tsandbox.MAIN.init();\n';
				code += '}\n';


				lychee.setEnvironment(environment);
				environment.init(new Function('sandbox', code));

			} else if (message === true) {

				console.warn('lychee.envinit: Invalid environment');
				console.info('lychee.envinit: Use lychee.envinit(env, profile) where env is a lychee.Environment instance');

			}

		},

		pkginit: function(identifier, settings, profile) {

			identifier = typeof identifier === 'string' ? identifier : null;
			settings   = settings instanceof Object     ? settings   : {};
			profile    = profile instanceof Object      ? profile    : {};


			_bootstrap_environment.call(this);


			if (identifier !== null) {

				let config = new Config('./lychee.pkg');

				config.onload = function() {

					let buffer = this.buffer || null;
					if (buffer instanceof Object) {

						if (buffer.build instanceof Object && buffer.build.environments instanceof Object) {

							let data = buffer.build.environments[identifier] || null;
							if (data instanceof Object) {

								let code         = '\n';
								let env_settings = Object.assign({
									id: lychee.ROOT.project + '/' + identifier.split('/').pop()
								}, data, settings);
								let env_profile  = Object.assign({}, data.profile, profile);
								let environment  = new lychee.Environment(env_settings);


								if (_environment !== null) {

									Object.values(_environment.definitions).forEach(function(definition) {
										environment.define(definition);
									});

								}


								code += '\n\n';
								code += 'if (sandbox === null) {\n';
								code += '\tconsole.error("lychee: pkginit() failed.");\n';
								code += '\treturn;\n';
								code += '}\n';
								code += '\n\n';

								code += [ 'lychee' ].concat(env_settings.packages.map(function(pkg) {
									return pkg.id;
								})).map(function(lib) {
									return 'let ' + lib + ' = sandbox.' + lib + ';';
								}).join('\n');

								code += '\n\n';
								code += 'sandbox.MAIN = new ' + env_settings.build + '(' + JSON.stringify(env_profile) + ');\n';
								code += '\n\n';
								code += 'if (typeof sandbox.MAIN.init === \'function\') {\n';
								code += '\tsandbox.MAIN.init();\n';
								code += '}\n';


								lychee.setEnvironment(environment);
								environment.init(new Function('sandbox', code));

							} else {

								console.warn('lychee.pkginit: Invalid settings for "' + identifier + '" in lychee.pkg.');
								console.info('lychee.pkginit: Insert settings at "/build/environments/\"' + identifier + '\"" in lychee.pkg.');

							}

						} else {

							console.warn('lychee.pkginit: Invalid package at "' + this.url + '".');
							console.info('lychee.pkginit: Replace lychee.pkg with the one from "/projects/boilerplate".');

						}

					} else {

						console.warn('lychee.pkginit: Invalid package at "' + this.url + '".');
						console.info('lychee.pkginit: Replace lychee.pkg with the one from "/projects/boilerplate".');

					}

				};

				config.load();

			}

		},

		inject: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			_bootstrap_environment.call(this);


			if (environment !== null) {

				if (this.environment !== null) {

					let that = this;

					Object.values(environment.definitions).forEach(function(definition) {
						that.environment.define(definition);
					});

					let build_old = this.environment.definitions[this.environment.build] || null;
					let build_new = environment.definitions[environment.build]           || null;

					if (build_old === null && build_new !== null) {
						this.environment.build = environment.build;
						this.environment.type  = environment.type;
					}


					return true;

				} else {

					console.warn('lychee.inject: Invalid default environment for injection.');
					console.info('lychee.inject: Use lychee.setEnvironment(env) before using lychee.inject(other).');

				}

			}


			return false;

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

		}

	};


	return Object.assign(lychee, Module);

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

