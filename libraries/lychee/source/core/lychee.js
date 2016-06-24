
lychee = typeof lychee !== 'undefined' ? lychee : (function(global) {

	/*
	 * NAMESPACE
	 */

	if (typeof lychee === 'undefined') {
		lychee = global.lychee = {};
	}



	/*
	 * POLYFILLS
	 */

	if (typeof Array.prototype.fill !== 'function') {

		Array.prototype.fill = function(value/*, start = 0, end = this.length */) {

			if (this === null || this === undefined) {
				throw new TypeError('Array.prototype.fill called on null or undefined');
			}

			var list      = Object(this);
			var length    = list.length >>> 0;
			var start     = arguments[1];
			var end       = arguments[2];
			var rel_start = start === undefined ?      0 : start >> 0;
			var rel_end   = end === undefined   ? length : end >> 0;


			var i_start = rel_start < 0 ? Math.max(length + rel_start, 0) : Math.min(rel_start, length);
			var i_end   = rel_end < 0   ? Math.max(length + rel_end, 0)   : Math.min(rel_end, length);

			for (var i = i_start; i < i_end; i++) {
				list[i] = value;
			}


			return list;

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


			var list    = Object(this);
			var length  = list.length >>> 0;
			var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			var value;

			for (var i = 0; i < length; i++) {

				value = list[i];

				if (predicate.call(thisArg, value, i, list)) {
					return value;
				}

			}


			return undefined;

		};

	}

	if (typeof Array.prototype.unique !== 'function') {

		Array.prototype.unique = function() {

			if (this === null || this === undefined) {
				throw new TypeError('Array.prototype.unique called on null or undefined');
			}


			var clone  = [];
			var list   = Object(this);
			var length = this.length >>> 0;
			var value;

			for (var i = 0; i < length; i++) {

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

		var _format_date = function(n) {
			return n < 10 ? '0' + n : '' + n;
		};

		Date.prototype.toJSON = function() {

			if (isFinite(this.valueOf()) === true) {

				return this.getUTCFullYear()             + '-' +
					_format_date(this.getUTCMonth() + 1) + '-' +
					_format_date(this.getUTCDate())      + 'T' +
					_format_date(this.getUTCHours())     + ':' +
					_format_date(this.getUTCMinutes())   + ':' +
					_format_date(this.getUTCSeconds())   + 'Z';

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


			for (var a = 1, al = arguments.length; a < al; a++) {

				var source = arguments[a];
				if (source != null) {

					for (var key in source) {

						if (Object.prototype.hasOwnProperty.call(source, key) === true) {
							object[key] = source[key];
						}

					}

				}

			}


			return object;

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


			var props   = [];
			var values  = [];
			var thisArg = arguments.length >= 3 ? arguments[2] : void 0;

			for (var prop in object) {

				var value = object[prop];

				if (Object.prototype.hasOwnProperty.call(object, prop)) {

					if (predicate.call(thisArg, value, prop, object)) {
						props.push(prop);
						values.push(value);
					}

				}

			}


			var filtered = {};

			for (var i = 0; i < props.length; i++) {
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


			var thisArg = arguments.length >= 3 ? arguments[2] : void 0;

			for (var prop in object) {

				var value = object[prop];

				if (Object.prototype.hasOwnProperty.call(object, prop)) {

					if (predicate.call(thisArg, value, prop, object)) {
						return value;
					}

				}

			}

			return undefined;

		};

	}

	if (typeof Object.keys !== 'function') {

		Object.keys = function(object) {

			if (object !== Object(object)) {
				throw new TypeError('Object.keys called on a non-object');
			}


			var keys = [];

			for (var prop in object) {

				if (Object.prototype.hasOwnProperty.call(object, prop)) {
					keys.push(prop);
				}

			}

			return keys;

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


			var clone   = {};
			var keys    = Object.keys(object).sort();
			var length  = keys.length >>> 0;
			var thisArg = arguments.length >= 3 ? arguments[2] : void 0;
			var key;
			var value;
			var tmp;


			for (var k = 0; k < length; k++) {

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


			var clone  = {};
			var keys   = Object.keys(object).sort();
			var length = keys.length >>> 0;
			var key;
			var value;

			for (var k = 0; k < length; k++) {

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


			var values = [];

			for (var prop in object) {

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


			var clone  = '' + this;
			var keys   = Object.keys(object);
			var values = Object.values(object);


			for (var k = 0, kl = keys.length; k < kl; k++) {

				var key   = keys[k];
				var value = values[k];

				if (value instanceof Array) {
					value = JSON.stringify(value);
				} else if (value instanceof Object) {
					value = JSON.stringify(value);
				} else if (typeof value !== 'string') {
					value = '' + value;
				}


				var pointers = [];
				var pointer  = clone.indexOf('${' + key + '}');

				while (pointer !== -1) {
					pointers.push(pointer);
					pointer = clone.indexOf('${' + key + '}', pointer + 1);
				}


				var offset = 0;

				for (var p = 0, pl = pointers.length; p < pl; p++) {

					var index = pointers[p];

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

	if (typeof String.prototype.trim !== 'function') {

		String.prototype.trim = function() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
		};

	}



	/*
	 * HELPERS
	 */

	var _environment = null;

	var _bootstrap_environment = function() {

		if (_environment === null) {

			_environment = new lychee.Environment({
				debug: false
			});

		}


		if (this.environment === null) {
			this.setEnvironment(_environment);
		}

	};

	var _resolve_reference = function(identifier) {

		var pointer = this;

		var ns = identifier.split('.');
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

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

	var Module = {

		debug:        true,
		environment:  _environment,

		ENVIRONMENTS: {},
		ROOT:         {
			lychee:  null,
			project: null
		},
		VERSION:      "2016-Q1",



		/*
		 * LIBRARY API
		 */

		diff: function(aobject, bobject) {

			var akeys = Object.keys(aobject);
			var bkeys = Object.keys(bobject);

			if (akeys.length !== bkeys.length) {
				return true;
			}


			for (var a = 0, al = akeys.length; a < al; a++) {

				var key = akeys[a];

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

				var valid = false;

				for (var val in template) {

					if (value === template[val]) {
						valid = true;
						break;
					}

				}


				return valid;

			}


			return false;

		},

		extend: function(target) {

			for (var a = 1, al = arguments.length; a < al; a++) {

				var object = arguments[a];
				if (object) {

					for (var prop in object) {

						if (object.hasOwnProperty(prop) === true) {
							target[prop] = object[prop];
						}

					}

				}

			}


			return target;

		},

		extendsafe: function(target) {

			for (var a = 1, al = arguments.length; a < al; a++) {

				var object = arguments[a];
				if (object) {

					for (var prop in object) {

						if (object.hasOwnProperty(prop) === true) {

							var tvalue = target[prop];
							var ovalue = object[prop];
							if (tvalue instanceof Array && ovalue instanceof Array) {

								lychee.extendsafe(target[prop], object[prop]);

							} else if (tvalue instanceof Object && ovalue instanceof Object) {

								lychee.extendsafe(target[prop], object[prop]);

							} else if (typeof tvalue === typeof ovalue) {

								target[prop] = object[prop];

							}

						}

					}

				}

			}


			return target;

		},

		extendunlink: function(target) {

			for (var a = 1, al = arguments.length; a < al; a++) {

				var object = arguments[a];
				if (object) {

					for (var prop in object) {

						if (object.hasOwnProperty(prop) === true) {

							var tvalue = target[prop];
							var ovalue = object[prop];
							if (tvalue instanceof Array && ovalue instanceof Array) {
								target[prop] = [];
								lychee.extendunlink(target[prop], object[prop]);
							} else if (tvalue instanceof Object && ovalue instanceof Object) {
								target[prop] = {};
								lychee.extendunlink(target[prop], object[prop]);
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

			var valid = false;
			var method, property;

			// 1. Interface validation on Template
			if (template instanceof Function && template.prototype instanceof Object && instance instanceof Function && instance.prototype instanceof Object) {

				valid = true;

				for (method in template.prototype) {

					if (typeof template.prototype[method] !== typeof instance.prototype[method]) {
						valid = false;
						break;
					}

				}


			// 2. Interface validation on Instance
			} else if (template instanceof Function && template.prototype instanceof Object && instance instanceof Object) {

				valid = true;

				for (method in template.prototype) {

					if (typeof template.prototype[method] !== typeof instance[method]) {
						valid = false;
						break;
					}

				}


			// 3. Interface validation on Struct
			} else if (template instanceof Object && instance instanceof Object) {

				valid = true;

				for (property in template) {

					if (template.hasOwnProperty(property) && instance.hasOwnProperty(property)) {

						if (typeof template[property] !== typeof instance[property]) {
							valid = false;
							break;
						}

					}

				}

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
			} catch(err) {
				data = null;
			}


			if (data !== null) {

				var instance = null;
				var scope    = (this.environment !== null ? this.environment.global : global);


				if (typeof data.reference === 'string') {

					var resolved_module = _resolve_reference.call(scope, data.reference);
					if (typeof resolved_module === 'object') {
						instance = resolved_module;
					}

				} else if (typeof data.constructor === 'string' && data.arguments instanceof Array) {

					var resolved_class = _resolve_reference.call(scope, data.constructor);
					if (typeof resolved_class === 'function') {

						var bindargs = [].splice.call(data.arguments, 0).map(function(value) {

							if (typeof value === 'string' && value.charAt(0) === '#') {

								if (lychee.debug === true) {
									console.log('lychee.deserialize: Injecting "' + value + '" from global');
								}

								var resolved = _resolve_reference.call(scope, value.substr(1));
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

				}


				if (instance !== null) {

					// High-Level ENTITY API
					if (typeof instance.deserialize === 'function') {

						var blob = data.blob || null;
						if (blob !== null) {
							instance.deserialize(blob);
						}

					// Low-Level ASSET API
					} else if (typeof instance.load === 'function') {
						instance.load();
					}


					return instance;

				} else {

					if (lychee.debug === true) {
						console.warn('lychee.deserialize: Require ' + (data.reference || data.constructor) + ' to deserialize it.');
					}

				}

			}


			return null;

		},

		serialize: function(definition) {

			definition = definition !== undefined ? definition : null;


			var data = null;

			if (definition !== null) {

				if (typeof definition === 'object') {

					if (typeof definition.serialize === 'function') {

						data = definition.serialize();

					} else {

						try {
							data = JSON.parse(JSON.stringify(definition));
						} catch(err) {
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

		define: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				_bootstrap_environment.call(this);


				var definition = new lychee.Definition(identifier);
				var that       = this;

				// XXX: First sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}

				// XXX: Second sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}


				definition.exports = function(callback) {

					lychee.Definition.prototype.exports.call(this, callback);
					that.environment.define(this);

				};


				return definition;

			}


			return null;

		},

		import: function(reference) {

			reference = typeof reference === 'string' ? reference : null;


			if (reference !== null) {

				_bootstrap_environment.call(this);


				var instance = null;
				var that     = this;

				// XXX: First sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}

				// XXX: Second sandboxed hierarchy
				if (that.environment.sandbox === true) {
					that = that.environment.global.lychee;
				}


				var resolved_module = _resolve_reference.call(that.environment.global, reference);
				if (resolved_module !== null) {
					instance = resolved_module;
				}


				if (instance === null) {

					if (lychee.debug === true) {
						console.warn('lychee.deserialize: Require ' + (reference) + ' to import it.');
					}

				}


				return instance;

			}


			return null;

		},

		envinit: function(environment, profile) {

			environment = environment instanceof lychee.Environment ? environment : null;
			profile     = profile instanceof Object                 ? profile     : {};


			_bootstrap_environment.call(this);


			if (environment !== null) {

				var code        = '\n';
				var id          = lychee.ROOT.project.substr(lychee.ROOT.lychee.length) + '/custom';
				var env_profile = lychee.extend({}, environment.profile, profile);


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
					return 'var ' + lib + ' = sandbox.' + lib + ';';
				}).join('\n');

				code += '\n\n';
				code += 'sandbox.MAIN = new ' + environment.build + '(' + JSON.stringify(env_profile) + ');\n';
				code += '\n\n';
				code += 'if (typeof sandbox.MAIN.init === \'function\') {\n';
				code += '\tsandbox.MAIN.init();\n';
				code += '}\n';


				lychee.setEnvironment(environment);
				environment.init(new Function('sandbox', code));

			}

		},

		pkginit: function(identifier, settings, profile) {

			identifier = typeof identifier === 'string' ? identifier : null;
			settings   = settings instanceof Object     ? settings   : {};
			profile    = profile instanceof Object      ? profile    : {};


			_bootstrap_environment.call(this);


			if (identifier !== null) {

				var config = new Config('./lychee.pkg');

				config.onload = function() {

					var buffer = this.buffer || null;
					if (buffer instanceof Object) {

						if (buffer.build instanceof Object && buffer.build.environments instanceof Object) {

							var data = buffer.build.environments[identifier] || null;
							if (data instanceof Object) {

								var code         = '\n';
								var env_settings = lychee.extend({
									id: lychee.ROOT.project + '/' + identifier.split('/').pop()
								}, data, settings);
								var env_profile  = lychee.extend({}, data.profile, profile);
								var environment  = new lychee.Environment(env_settings);


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
									return 'var ' + lib + ' = sandbox.' + lib + ';';
								}).join('\n');

								code += '\n\n';
								code += 'sandbox.MAIN = new ' + env_settings.build + '(' + JSON.stringify(env_profile) + ');\n';
								code += '\n\n';
								code += 'if (typeof sandbox.MAIN.init === \'function\') {\n';
								code += '\tsandbox.MAIN.init();\n';
								code += '}\n';


								lychee.setEnvironment(environment);
								environment.init(new Function('sandbox', code));

							}

						}

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

					var that = this;

					Object.values(environment.definitions).forEach(function(definition) {
						that.environment.define(definition);
					});

					var build_old = this.environment.definitions[this.environment.build] || null;
					var build_new = environment.definitions[environment.build]           || null;

					if (build_old === null && build_new !== null) {
						this.environment.build = environment.build;
						this.environment.type  = environment.type;
					}


					return true;

				} else {

					if (lychee.debug === true) {
						console.warn('lychee.inject: Set Environment to inject another into it.');
					}

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


	return Module.extend(lychee, Module);

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

