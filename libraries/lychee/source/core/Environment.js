
lychee.Environment = typeof lychee.Environment !== 'undefined' ? lychee.Environment : (function(global) {

	var lychee  = global.lychee;
	var console = global.console;



	/*
	 * EVENTS
	 */

	var _export_loop = function(cache) {

		var that  = this;
		var load  = cache.load;
		var ready = cache.ready;
		var track = cache.track;

		var identifier, definition;


		for (var l = 0, ll = load.length; l < ll; l++) {

			identifier = load[l];
			definition = this.definitions[identifier] || null;


			if (definition !== null) {

				if (ready.indexOf(identifier) === -1) {
					ready.push(identifier);
				}

				load.splice(l, 1);
				track.splice(l, 1);
				ll--;
				l--;

			}

		}


		for (var r = 0, rl = ready.length; r < rl; r++) {

			identifier = ready[r];
			definition = this.definitions[identifier] || null;

			if (definition !== null) {

				var dependencies = _resolve_definition.call(this, definition);
				if (dependencies.length > 0) {

					for (var d = 0, dl = dependencies.length; d < dl; d++) {

						var dependency = dependencies[d];
						if (load.indexOf(dependency) === -1 && ready.indexOf(dependency) === -1) {

							that.load(dependency);
							load.push(dependency);
							track.push(identifier);

						}

					}

				} else {

					_export_definition.call(this, definition);

					ready.splice(r, 1);
					rl--;
					r--;

				}

			}

		}


		if (load.length === 0 && ready.length === 0) {

			cache.active = false;

		} else {

			if (Date.now() > cache.timeout) {
				cache.active = false;
			}

		}

	};



	/*
	 * HELPERS
	 */

	var _validate_definition = function(definition) {

		if (!(definition instanceof lychee.Definition)) {
			return false;
		}


		var supported = false;

		if (definition._supports !== null) {

			// TODO: We need a Proxy for determination of all required sandboxed properties
			supported = definition._supports.call(global, lychee, global);

		} else {
			supported = true;
		}


		var tagged = true;

		if (Object.keys(definition._tags).length > 0) {

			for (var tag in definition._tags) {

				var value = definition._tags[tag];
				var tags  = this.tags[tag] || null;
				if (tags instanceof Array) {

					if (tags.indexOf(value) === -1) {

						tagged = false;
						break;

					}

				}

			}

		}


		var type = this.type;
		if (type === 'build') {

			return tagged;

		} else if (type === 'export') {

			return tagged;

		} else if (type === 'source') {

			return supported && tagged;

		}


		return false;

	};

	var _resolve_definition = function(definition) {

		var dependencies = [];


		if (definition instanceof lychee.Definition) {

			for (var i = 0, il = definition._includes.length; i < il; i++) {

				var inc      = definition._includes[i];
				var incclass = _get_class.call(this.global, inc);
				if (incclass === null) {
					dependencies.push(inc);
				}

			}

			for (var r = 0, rl = definition._requires.length; r < rl; r++) {

				var req      = definition._requires[r];
				var reqclass = _get_class.call(this.global, req);
				if (reqclass === null) {
					dependencies.push(req);
				}

			}

		}


		return dependencies;

	};

	var _export_definition = function(definition) {

		if (_get_class.call(this.global, definition.id) !== null) {
			return false;
		}


		var namespace  = _get_namespace.call(this.global, definition.id);
		var packageId  = definition.packageId;
		var classId    = definition.classId.split('.').pop();


		if (this.debug === true) {
			var info = Object.keys(definition._attaches).length > 0 ? ('(' + Object.keys(definition._attaches).length + ' Attachment(s))') : '';
			this.global.console.log('lychee-Environment (' + this.id + '): Exporting "' + definition.id + '" ' + info);
		}



		/*
		 * 1. Export Class, Module or Callback
		 */

		var template = null;
		if (definition._exports !== null) {

			if (this.debug === true) {

				try {

					// TODO: This needs to be sandboxed, so global will be this.global

					template = definition._exports.call(
						definition._exports,
						this.global.lychee,
						global,
						definition._attaches
					) || null;

				} catch(err) {
					lychee.Debugger.report(this, err, definition);
				}

			} else {

				// TODO: This needs to be sandboxed, so global will be this.global

				template = definition._exports.call(
					definition._exports,
					this.global.lychee,
					global,
					definition._attaches
				) || null;

			}

		}



		/*
		 * 2. Assign Class, Module or Callback
		 */

		if (template !== null) {

			/*
			 * 2.1 Assign and export Class or Module
			 */

			var includes = definition._includes;
			if (includes.length > 0) {

				var ownenums   = null;
				var ownmethods = null;
				var ownkeys    = Object.keys(template);
				var ownproto   = template.prototype;


				if (ownkeys.length > 0) {

					ownenums = {};

					for (var ok = 0, okl = ownkeys.length; ok < okl; ok++) {

						var ownkey = ownkeys[ok];
						if (ownkey === ownkey.toUpperCase()) {
							ownenums[ownkey] = template[ownkey];
						}

					}

					if (Object.keys(ownenums).length === 0) {
						ownenums = null;
					}

				}

				if (ownproto instanceof Object) {

					ownmethods = {};

					for (var ownmethod in ownproto) {
						ownmethods[ownmethod] = ownproto[ownmethod];
					}

					if (Object.keys(ownmethods).length === 0) {
						ownmethods = null;
					}

				}


				// Define classId in namespace
				Object.defineProperty(namespace, classId, {
					value:        template,
					writable:     false,
					enumerable:   true,
					configurable: false
				});


				namespace[classId].displayName = definition.id;
				namespace[classId].prototype = {};


				var tplenums   = {};
				var tplmethods = [ namespace[classId].prototype ];


				for (var i = 0, il = includes.length; i < il; i++) {

					var include = _get_template.call(this.global, includes[i]);
					if (include !== null) {

						var inckeys = Object.keys(include);
						if (inckeys.length > 0) {

							for (var ik = 0, ikl = inckeys.length; ik < ikl; ik++) {

								var inckey = inckeys[ik];
								if (inckey === inckey.toUpperCase()) {
									tplenums[inckey] = include[inckey];
								}

							}

						}

						tplmethods.push(include.prototype);

					} else {

						if (this.debug === true) {
							console.error('lychee-Environment (' + this.id + '): Invalid Inclusion of "' + includes[i] + '"');
						}

					}

				}


				if (ownenums !== null) {

					for (var e in ownenums) {
						tplenums[e] = ownenums[e];
					}

				}

				if (ownmethods !== null) {
					tplmethods.push(ownmethods);
				}


				for (var e in tplenums) {
					namespace[classId][e] = tplenums[e];
				}

				Object.assign.apply(lychee, tplmethods);

				Object.seal(namespace[classId].prototype);


			/*
			 * 2.2 Nothing to include, plain Definition
			 */

			} else {

				namespace[classId] = template;
				namespace[classId].displayName = definition.id;


				if (template instanceof Object) {
					Object.seal(namespace[classId]);
				}

			}

		} else {

			namespace[classId] = function() {};
			namespace[classId].displayName = definition.id;

			if (this.debug === true) {
				this.global.console.error('lychee-Environment (' + this.id + '): Invalid Definition "' + definition.id + '", it is a Dummy now.');
			}

		}


		return true;

	};

	var _get_class = function(identifier) {

		var id = identifier.split('.').pop();

		var pointer = _get_namespace.call(this, identifier);
		if (pointer[id] !== undefined) {
			return pointer;
		}


		return null;

	};

	var _get_namespace = function(identifier) {

		var pointer = this;

		var ns = identifier.split('.'); ns.pop();
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] === undefined) {
				pointer[name] = {};
			}

			pointer = pointer[name];

		}


		return pointer;

	};

	var _get_template = function(identifier) {

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
	 * STRUCTS
	 */

	var _Sandbox = function(settings) {

		var that     = this;
		var _std_err = '';
		var _std_out = '';


		this.console = {};
		this.console.log = function() {

			var str = '\n';

			for (var a = 0, al = arguments.length; a < al; a++) {

				var arg = arguments[a];
				if (arg instanceof Object) {
					str += JSON.stringify(arg, null, '\t');
				} else if (typeof arg.toString === 'function') {
					str += arg.toString();
				} else {
					str += arg;
				}

				if (a < al - 1) {
					str += '\t';
				}

			}


			if (str.substr(0, 5) === '\n(E)\t') {
				_std_err += str;
			} else {
				_std_out += str;
			}

		};

		this.console.info = function() {

			var args = [ '(I)\t' ];

			for (var a = 0, al = arguments.length; a < al; a++) {
				args.push(arguments[a]);
			}

			this.log.apply(this, args);

		};

		this.console.warn = function() {

			var args = [ '(W)\t' ];

			for (var a = 0, al = arguments.length; a < al; a++) {
				args.push(arguments[a]);
			}

			this.log.apply(this, args);

		};

		this.console.error = function() {

			var args = [ '(E)\t' ];

			for (var a = 0, al = arguments.length; a < al; a++) {
				args.push(arguments[a]);
			}

			this.log.apply(this, args);

		};

		this.console.deserialize = function(blob) {

			if (typeof blob.stdout === 'string') {
				_std_out = blob.stdout;
			}

			if (typeof blob.stderr === 'string') {
				_std_err = blob.stderr;
			}

		};

		this.console.serialize = function() {

			var blob = {};


			if (_std_out.length > 0) blob.stdout = _std_out;
			if (_std_err.length > 0) blob.stderr = _std_err;


			return {
				'reference': 'console',
				'blob':      Object.keys(blob).length > 0 ? blob : null
			};

		};


		this.Buffer  = global.Buffer;
		this.Config  = global.Config;
		this.Font    = global.Font;
		this.Music   = global.Music;
		this.Sound   = global.Sound;
		this.Texture = global.Texture;


		this.lychee              = {};
		this.lychee.environment  = null;
		this.lychee.ENVIRONMENTS = global.lychee.ENVIRONMENTS;
		this.lychee.VERSION      = global.lychee.VERSION;
		this.lychee.ROOT         = {};
		this.lychee.ROOT.lychee  = global.lychee.ROOT.lychee;
		this.lychee.ROOT.project = global.lychee.ROOT.project;

		[
			'assignsafe',
			'assignunlink',
			'debug',
			'diff',
			'enumof',
			'interfaceof',
			'deserialize',
			'serialize',
			'define',
			'import',
			'envinit',
			'pkginit',
			'setEnvironment',
			'Asset',
			'Debugger',
			'Definition',
			'Environment',
			'Package'
		].forEach(function(identifier) {

			that.lychee[identifier] = global.lychee[identifier];

		});


		this.require = function(path) {
			return global.require(path);
		};

		this.setTimeout = function(callback, timeout) {
			global.setTimeout(callback, timeout);
		};

		this.setInterval = function(callback, interval) {
			global.setInterval(callback, interval);
		};



		/*
		 * INITIALIZATION
		 */

		if (settings instanceof Object) {

			Object.keys(settings).forEach(function(key) {

				var instance = lychee.deserialize(settings[key]);
				if (instance !== null) {
					this[key] = instance;
				}

			}.bind(this));

		}

	};

	_Sandbox.prototype = {

		deserialize: function(blob) {

			if (blob.console instanceof Object) {
				this.console.deserialize(blob.console.blob);
			}

		},

		serialize: function() {

			var settings = {};
			var blob     = {};


			Object.keys(this).filter(function(key) {
				return key.charAt(0) !== '_' && key === key.toUpperCase();
			}).forEach(function(key) {
				settings[key] = lychee.serialize(this[key]);
			}.bind(this));


			blob.lychee         = {};
			blob.lychee.debug   = this.lychee.debug;
			blob.lychee.VERSION = this.lychee.VERSION;
			blob.lychee.ROOT    = this.lychee.ROOT;


			var data = this.console.serialize();
			if (data.blob !== null) {
				blob.console = data;
			}


			return {
				'constructor': '_Sandbox',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var _id = 0;

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.id          = 'lychee-Environment-' + _id++;
		this.build       = 'app.Main';
		this.debug       = true;
		this.definitions = {};
		this.global      = global;
		this.packages    = [];
		this.sandbox     = false;
		this.tags        = {};
		this.timeout     = 10000;
		this.type        = 'source';


		this.__cache = {
			active:   false,
			start:    0,
			end:      0,
			timeout:  0,
			load:     [],
			ready:    [],
			track:    []
		};


		// Alternative API for lychee.pkg

		if (settings.packages instanceof Array) {

			for (var p = 0, pl = settings.packages.length; p < pl; p++) {

				var pkg = settings.packages[p];
				if (pkg instanceof Array) {
					settings.packages[p] = new lychee.Package(pkg[0], pkg[1]);
				}

			}

		}


		this.setSandbox(settings.sandbox);
		this.setDebug(settings.debug);

		this.setDefinitions(settings.definitions);
		this.setId(settings.id);
		this.setPackages(settings.packages);
		this.setTags(settings.tags);
		this.setTimeout(settings.timeout);

		// Needs this.packages to be ready
		this.setType(settings.type);
		this.setBuild(settings.build);


		settings = null;

	};



	/*
	 * BOOTSTRAP API
	 */

	Class.__FILENAME = null;



	/*
	 * IMPLEMENTATION
	 */

	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.definitions instanceof Object) {

				for (var id in blob.definitions) {
					this.definitions[id] = lychee.deserialize(blob.definitions[id]);
				}

			}

			if (blob.packages instanceof Array) {

				var packages = [];

				for (var p = 0, pl = blob.packages.length; p < pl; p++) {
					packages.push(lychee.deserialize(blob.packages[p]));
				}

				this.setPackages(packages);

				// This is a dirty hack which is allowed here
				this.setType(blob.type);
				this.setBuild(blob.build);

			}

			if (blob.global instanceof Object) {

				this.global = new _Sandbox(blob.global.arguments[0]);

				if (blob.global.blob !== null) {
					this.global.deserialize(blob.global.blob);
				}

			}

		},

		serialize: function() {

			var settings = {};
			var blob     = {};


			if (this.id !== '0')           settings.id      = this.id;
			if (this.build !== 'app.Main') settings.build   = this.build;
			if (this.debug !== true)       settings.debug   = this.debug;
			if (this.sandbox !== true)     settings.sandbox = this.sandbox;
			if (this.timeout !== 10000)    settings.timeout = this.timeout;
			if (this.type !== 'source')    settings.type    = this.type;


			if (Object.keys(this.tags).length > 0) {

				settings.tags = {};

				for (var tagid in this.tags) {
					settings.tags[tagid] = this.tags[tagid];
				}

			}

			if (Object.keys(this.definitions).length > 0) {

				blob.definitions = {};

				for (var defid in this.definitions) {
					blob.definitions[defid] = lychee.serialize(this.definitions[defid]);
				}

			}

			if (this.packages.length > 0) {

				blob.packages = [];

				for (var p = 0, pl = this.packages.length; p < pl; p++) {
					blob.packages.push(lychee.serialize(this.packages[p]));
				}

				// This is a dirty hack which is allowed here
				blob.type  = this.type;
				blob.build = this.build;

			}

			if (this.sandbox === true) {
				blob.global = this.global.serialize();
			}


			return {
				'constructor': 'lychee.Environment',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		load: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				var packageId = identifier.split('.')[0];
				var classId   = identifier.split('.').slice(1).join('.');


				var definition = this.definitions[identifier] || null;
				if (definition !== null) {

					return true;

				} else {

					var pkg = this.packages.find(function(pkg) {
						return pkg.id === packageId;
					}) || null;

					if (pkg !== null && pkg.isReady() === true) {

						var result = pkg.load(classId, this.tags);
						if (result === true) {

							if (this.debug === true) {
								this.global.console.log('lychee-Environment (' + this.id + '): Loading "' + identifier + '" from Package "' + pkg.id + '"');
							}

						}


						return result;

					}

				}

			}


			return false;

		},

		define: function(definition) {

			var filename = Class.__FILENAME || null;
			if (filename !== null) {

				if (definition instanceof lychee.Definition) {

					var oldPackageId = definition.packageId;
					var newPackageId = null;

					for (var p = 0, pl = this.packages.length; p < pl; p++) {

						var root = this.packages[p].root;
						if (filename.substr(0, root.length) === root) {
							newPackageId = this.packages[p].id;
							break;
						}

					}


					if (newPackageId !== null && newPackageId !== oldPackageId) {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): Injecting Definition "' + definition.id + '" as "' + newPackageId + '.' + definition.classId + '"');
						}


						definition.packageId = newPackageId;
						definition.id        = definition.packageId + '.' + definition.classId;

						for (var i = 0, il = definition._includes.length; i < il; i++) {

							var inc = definition._includes[i];
							if (inc.substr(0, oldPackageId.length) === oldPackageId) {
								definition._includes[i] = newPackageId + inc.substr(oldPackageId.length);
							}

						}

						for (var r = 0, rl = definition._requires.length; r < rl; r++) {

							var req = definition._requires[r];
							if (req.substr(0, oldPackageId.length) === oldPackageId) {
								definition._requires[r] = newPackageId + req.substr(oldPackageId.length);
							}

						}

					}

				}

			}


			if (_validate_definition.call(this, definition) === true) {

				if (this.debug === true) {
					var info = Object.keys(definition._tags).length > 0 ? ('(' + JSON.stringify(definition._tags) + ')') : '';
					this.global.console.log('lychee-Environment (' + this.id + '): Mapping "' + definition.id + '" ' + info);
				}

				this.definitions[definition.id] = definition;


				return true;

			} else {

				if (this.debug === true) {
					this.global.console.error('lychee-Environment (' + this.id + '): Invalid Definition "' + definition.id + '"');
				}


				return false;

			}

		},

		init: function(callback) {

			callback = callback instanceof Function ? callback : function() {};


			if (this.debug === true) {
				this.global.lychee.ENVIRONMENTS[this.id] = this;
			}


			var build = this.build;
			var cache = this.__cache;
			var type  = this.type;
			var that  = this;


			if (type === 'source' || type === 'export') {

				var lypkg = this.packages.find(function(pkg) {
					return pkg.id === 'lychee';
				}) || null;

				if (lypkg === null) {

					lypkg = new lychee.Package('lychee', '/libraries/lychee/lychee.pkg');

					if (this.debug === true) {
						this.global.console.log('lychee-Environment (' + this.id + '): Injecting Package "lychee"');
					}

					lypkg.setEnvironment(this);
					this.packages.push(lypkg);

				}

			}


			if (build !== null && cache.active === false) {

				var result = this.load(build);
				if (result === true) {

					if (this.debug === true) {
						this.global.console.log('lychee-Environment (' + this.id + '): BUILD START ("' + this.build + '")');
					}


					cache.start   = Date.now();
					cache.timeout = Date.now() + this.timeout;
					cache.load    = [ build ];
					cache.ready   = [];
					cache.active  = true;


					var onbuildtimeout = function() {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): BUILD TIMEOUT (' + (cache.end - cache.start) + 'ms)');
						}


						// XXX: Always show Dependency Errors
						if (cache.load.length > 0) {

							this.global.console.error('lychee-Environment (' + this.id + '): Invalid Dependencies\n' + cache.load.map(function(value, index) {
								return '\t - ' + value + ' (required by ' + cache.track[index] + ')';
							}).join('\n'));

						}


						if (this.debug === true) {

							try {
								callback.call(this.global, null);
							} catch(err) {
								lychee.Debugger.report(this, err, null);
							}

						} else {

							callback.call(this.global, null);

						}

					};

					var onbuildsuccess = function() {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): BUILD END (' + (cache.end - cache.start) + 'ms)');
						}


						if (this.debug === true) {

							try {
								callback.call(this.global, this.global);
							} catch(err) {
								lychee.Debugger.report(this, err, null);
							}

						} else {

							callback.call(this.global, this.global);

						}

					};


					var intervalId = setInterval(function() {

						var cache = that.__cache;
						if (cache.active === true) {

							_export_loop.call(that, cache);

						} else if (cache.active === false) {

							if (intervalId !== null) {
								clearInterval(intervalId);
								intervalId = null;
							}


							cache.end = Date.now();


							if (cache.end > cache.timeout) {
								onbuildtimeout.call(that);
							} else {
								onbuildsuccess.call(that);
							}

						}

					}, (1000 / 60) | 0);

				} else {

					if (this.debug === true) {
						this.global.console.log('lychee-Environment (' + this.id + '): Package not ready, retrying in 100ms ...');
					}


					setTimeout(function() {
						that.init(callback);
					}, 100);

				}

			}

		},

		resolve: function(path) {

			path = typeof path === 'string' ? path : '';


			var proto = path.split(':')[0] || '';
			if (proto.match(/http|https/g) === null) {
				path = (path.charAt(0) === '/' ? (lychee.ROOT.lychee + path) : (lychee.ROOT.project + '/' + path));
			}


			var tmp = path.split('/');

			for (var t = 0, tl = tmp.length; t < tl; t++) {

				if (tmp[t] === '.') {
					tmp.splice(t, 1);
					tl--;
					t--;
				} else if (tmp[t] === '..') {
					tmp.splice(t - 1, 2);
					tl -= 2;
					t  -= 2;
				}

			}

			return tmp.join('/');

		},

		setBuild: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				var type = this.type;
				if (type === 'build') {

					this.build = identifier;

					return true;

				} else {

					var pkg = this.packages.find(function(pkg) {
						return pkg.id === identifier.split('.')[0];
					});

					if (pkg !== null) {

						this.build = identifier;

						return true;

					}

				}

			}


			return false;

		},

		setDebug: function(debug) {

			if (debug === true || debug === false) {

				this.debug = debug;

				if (this.sandbox === true) {
					this.global.lychee.debug = debug;
				}

				return true;

			}


			return false;

		},

		setDefinitions: function(definitions) {

			definitions = definitions instanceof Object ? definitions : null;


			if (definitions !== null) {

				for (var identifier in definitions) {

					var definition = definitions[identifier];
					if (definition instanceof lychee.Definition) {
						this.definitions[identifier] = definition;
					}

				}


				return true;

			}


			return false;

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.id = id;


				return true;

			}


			return false;

		},

		setPackages: function(packages) {

			packages = packages instanceof Array ? packages : null;


			if (packages !== null) {

				this.packages.forEach(function(pkg) {
					pkg.setEnvironment(null);
				});

				this.packages = packages.filter(function(pkg) {

					if (pkg instanceof lychee.Package) {

						if (this.debug === true) {
							this.global.console.log('lychee-Environment (' + this.id + '): Adding Package "' + pkg.id + '"');
						}

						pkg.setEnvironment(this);

						return true;

					}


					return false;

				}.bind(this));


				return true;

			}


			return false;

		},

		setSandbox: function(sandbox) {

			if (sandbox === true || sandbox === false) {


				if (sandbox !== this.sandbox) {

					this.sandbox = sandbox;


					if (sandbox === true) {

						this.global = new _Sandbox();
						this.global.lychee.setEnvironment(this);

					} else {

						this.global = global;

					}

				}


				return true;

			}


			return false;

		},

		setTags: function(tags) {

			tags = tags instanceof Object ? tags : null;


			if (tags !== null) {

				this.tags = {};


				for (var type in tags) {

					var values = tags[type];
					if (values instanceof Array) {

						this.tags[type] = values.filter(function(value) {
							return typeof value === 'string';
						});

					}

				}


				return true;

			}


			return false;

		},

		setTimeout: function(timeout) {

			timeout = typeof timeout === 'number' ? timeout : null;


			if (timeout !== null) {

				this.timeout = timeout;

				return true;

			}


			return false;

		},

		setType: function(type) {

			if (type === 'source' || type === 'export' || type === 'build') {

				this.type = type;


				for (var p = 0, pl = this.packages.length; p < pl; p++) {
					this.packages[p].setType(this.type);
				}


				return true;

			}


			return false;

		}

	};


	return Class;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

