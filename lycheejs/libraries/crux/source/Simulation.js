
lychee.Simulation = typeof lychee.Simulation !== 'undefined' ? lychee.Simulation : (function(global) {

	let   _id      = 0;
	const _console = global.console;
	const _lychee  = global.lychee;



	/*
	 * HELPERS
	 */

	const _get_debug = function() {

		let debug       = _lychee.debug;
		let environment = this.environment;
		if (environment !== null) {
			debug = environment.debug;
		}

		return debug;

	};

	const _get_console = function() {

		let console     = _console;
		let environment = this.environment;
		if (environment !== null) {
			console = environment.global.console;
		}

		return console;

	};

	const _get_global = function() {

		let pointer     = global;
		let environment = this.environment;
		if (environment !== null) {
			pointer = environment.global;
		}

		return pointer;

	};

	const _build_loop = function(cache) {

		let load  = cache.load;
		let trace = cache.trace;


		for (let l = 0, ll = load.length; l < ll; l++) {

			let identifier    = load[l];
			let specification = this.specifications[identifier] || null;
			if (specification !== null) {

				if (trace.indexOf(identifier) === -1) {
					trace.push(identifier);
				}

				load.splice(l, 1);
				ll--;
				l--;

			}

		}


		for (let t = 0, tl = trace.length; t < tl; t++) {

			let identifier = trace[t];
			let specification = this.specifications[identifier] || null;
			if (specification !== null) {

				let dependencies = _resolve_dependencies.call(this, specification);
				if (dependencies.length > 0) {

					for (let d = 0, dl = dependencies.length; d < dl; d++) {

						let dependency = dependencies[d];
						if (load.indexOf(dependency) === -1 && trace.indexOf(dependency) === -1) {

							this.load(dependency);
							load.push(dependency);

						}

					}

				} else {

					specification.export(this.sandboxes);

					trace.splice(t, 1);
					tl--;
					t--;

				}

			}

		}


		if (load.length === 0 && trace.length === 0) {

			cache.active = false;

		} else {

			if (Date.now() > cache.timeout) {
				cache.active = false;
			}

		}

	};

	const _on_build_success = function(cache, callback) {

		let console     = _get_console.call(this);
		let debug       = _get_debug.call(this);
		let environment = this.environment;
		let sandboxes   = this.sandboxes;


		if (debug === true) {
			console.info('lychee.Simulation ("' + this.id + '"): BUILD END (' + (cache.end - cache.start) + 'ms).');
		}


		try {
			callback.call(environment.global, sandboxes);
		} catch (err) {
			_lychee.Debugger.report(environment, err, null);
		}

	};

	const _on_build_timeout = function(cache, callback) {

		let console     = _get_console.call(this);
		let debug       = _get_debug.call(this);
		let environment = this.environment;


		if (debug === true) {
			console.warn('lychee.Simulation ("' + this.id + '"): BUILD TIMEOUT (' + (cache.end - cache.start) + 'ms).');
		}


		if (cache.load.length > 0) {
			console.error('lychee.Simulation ("' + this.id + '"): Invalid Dependencies\n' + cache.load.map(value => '\t - ' + value).join('\n') + '.');
		}


		try {
			callback.call(environment.global, null);
		} catch (err) {
			_lychee.Debugger.report(environment, err, null);
		}

	};

	const _resolve = function(identifier) {

		let pointer   = this;
		let namespace = identifier.split('.');
		let id        = namespace.pop();

		for (let n = 0, nl = namespace.length; n < nl; n++) {

			let name = namespace[n];

			if (pointer[name] === undefined) {
				pointer[name] = {};
			}

			pointer = pointer[name];

		}


		let check = id.toLowerCase();
		if (check === id) {

			if (pointer[id] === undefined) {
				pointer[id] = {};
			}

			return pointer[id];

		} else {

			if (pointer[id] !== undefined) {
				return pointer[id];
			}

		}


		return null;

	};

	const _resolve_dependencies = function(specification) {

		let dependencies = [];

		if (specification instanceof _lychee.Specification) {

			for (let r = 0, rl = specification._requires.length; r < rl; r++) {

				let req   = specification._requires[r];
				let check = _resolve.call(this.sandboxes, req);
				if (check === null) {
					dependencies.push(req);
				}

			}

		}

		return dependencies;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id             = 'lychee-Simulation-' + _id++;
		this.environment    = null;
		this.specifications = {};
		this.target         = 'app.Main';
		this.timeout        = 10000;

		this.sandboxes  = {};
		this.__cache    = {
			active:        false,
			assimilations: [],
			start:         0,
			end:           0,
			retries:       0,
			timeout:       0,
			load:          [],
			trace:         []
		};
		this.__packages = {};


		this.setId(states.id);
		this.setSpecifications(states.specifications);
		this.setEnvironment(states.environment);
		this.setTimeout(states.timeout);

		// Needs this.__packages to be ready
		this.setTarget(states.target);


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.specifications instanceof Object) {

				for (let id in blob.specifications) {
					this.specifications[id] = lychee.deserialize(blob.specifications[id]);
				}

			}

			if (blob.environment instanceof Object) {
				this.setEnvironment(lychee.deserialize(blob.environment));
			}

		},

		serialize: function() {

			let states = {};
			let blob   = {};


			if (this.id !== '')             states.id      = this.id;
			if (this.target !== 'app.Main') states.target  = this.target;
			if (this.timeout !== 10000)     states.timeout = this.timeout;


			if (Object.keys(this.specifications).length > 0) {

				blob.specifications = {};

				for (let sid in this.specifications) {
					blob.specifications[sid] = lychee.serialize(this.specifications[sid]);
				}

			}


			return {
				'constructor': 'lychee.Simulation',
				'arguments':   [ states ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		load: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				let tmp    = identifier.split('.');
				let pkg_id = tmp[0];
				let def_id = tmp.slice(1).join('.');


				let specification = this.specifications[identifier] || null;
				if (specification !== null) {

					return true;

				} else {

					let pkg = this.__packages[pkg_id] || null;
					if (pkg !== null && pkg.config !== null) {

						let result = pkg.load(def_id);
						if (result === true) {

							let debug = _get_debug.call(this);
							if (debug === true) {
								console.log('lychee.Simulation ("' + this.id + '"): Loading "' + identifier + '" from Package "' + pkg.id + '".');
							}

						}

						return result;

					}

				}

			}


			return false;

		},

		specify: function(specification, inject) {

			specification = specification instanceof lychee.Specification ? specification : null;
			inject        = inject === true;


			let console = _get_console.call(this);
			let debug   = _get_debug.call(this);


			if (specification !== null) {

				let url = specification.url || null;
				if (url !== null && inject === false) {

					let old_pkg_id   = specification.id.split('.')[0];
					let new_pkg_id   = null;
					let assimilation = true;


					let packages = this.__packages;

					for (let pid in packages) {

						let pkg = packages[pid];

						if (url.startsWith(pkg.root)) {
							new_pkg_id = pkg.id;
						}

						if (pid === old_pkg_id || pid === new_pkg_id) {
							assimilation = false;
						}

					}


					if (assimilation === true) {

						if (debug === true) {
							console.log('lychee.Simulation ("' + this.id + '"): Assimilating Specification "' + specification.id + '".');
						}


						this.__cache.assimilations.push(specification.id);

					} else if (new_pkg_id !== null && new_pkg_id !== old_pkg_id) {

						if (debug === true) {
							console.log('lychee.Simulation ("' + this.id + '"): Injecting Specification "' + specification.id + '" into Package "' + new_pkg_id + '".');
						}


						specification.id = new_pkg_id + '.' + specification.id.split('.').slice(1).join('.');

						for (let r = 0, rl = specification._requires.length; r < rl; r++) {

							let req = specification._requires[r];
							if (req.startsWith(old_pkg_id)) {
								specification._requires[r] = new_pkg_id + req.substr(old_pkg_id.length);
							}

						}

					}

				} else {

					// XXX: Direct injection has no auto-mapping

				}


				if (debug === true) {
					console.log('lychee.Simulation ("' + this.id + '"): Mapping Specification "' + specification.id + '".');
				}


				this.specifications[specification.id] = specification;


				return true;

			}


			console.error('lychee.Simulation ("' + this.id + '"): Invalid Specification "' + specification.id + '".');


			return false;

		},

		init: function(callback) {

			callback = callback instanceof Function ? callback : null;


			let cache       = this.__cache;
			let console     = _get_console.call(this);
			let debug       = _get_debug.call(this);
			let environment = this.environment;
			let target      = this.target;


			if (debug === true) {
				global.lychee.SIMULATIONS[this.id] = this;
			}


			if (target !== null && environment !== null && cache.active === false) {

				let result = this.load(target);
				if (result === true) {

					if (debug === true) {
						console.info('lychee.Simulation ("' + this.id + '"): BUILD START ("' + target + '").');
					}


					cache.start   = Date.now();
					cache.timeout = Date.now() + this.timeout;
					cache.load    = [ target ];
					cache.trace   = [];
					cache.active  = true;


					let interval = setInterval(_ => {

						let cache = this.__cache;
						if (cache.active === true) {

							_build_loop.call(this, cache);

						} else if (cache.active === false) {

							if (interval !== null) {
								clearInterval(interval);
								interval = null;
							}


							let assimilations = cache.assimilations;
							if (assimilations.length > 0) {

								for (let a = 0, al = assimilations.length; a < al; a++) {

									let identifier    = assimilations[a];
									let specification = this.specifications[identifier] || null;
									if (specification !== null) {
										specification.export(this.sandboxes);
									}

								}

							}


							cache.end = Date.now();


							if (cache.end > cache.timeout) {
								_on_build_timeout.call(this, cache, callback);
							} else {
								_on_build_success.call(this, cache, callback);
							}

						}

					}, (1000 / 60) | 0);

				} else {

					cache.retries++;


					if (cache.retries < 3) {

						if (debug === true) {
							console.warn('lychee.Simulation ("' + this.id + '"): Unready Package "' + target + '" (retrying in 100ms ...).');
						}

						setTimeout(_ => this.init(callback), 100);

					} else {

						console.error('lychee.Simulation ("' + this.id + '"): Invalid Dependencies\n\t - ' + target + ' (target).');


						try {
							callback.call(environment.global || null, null);
						} catch (err) {
							_lychee.Debugger.report(environment, err, null);
						}

					}

				}


				return true;

			}


			try {
				callback.call(environment.global || null, null);
			} catch (err) {
				_lychee.Debugger.report(environment, err, null);
			}


			return false;

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;
				this.__packages  = {};

				for (let pid in environment.packages) {

					let pkg = environment.packages[pid];

					this.__packages[pid] = new lychee.Package({
						id:         pkg.id,
						url:        pkg.url,
						type:       'review',
						simulation: this
					});

				}

				return true;

			} else {

				this.environment = null;
				this.__packages  = {};

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

		setSpecifications: function(specifications) {

			specifications = specifications instanceof Object ? specifications : null;


			if (specifications !== null) {

				for (let identifier in specifications) {

					let specification = specifications[identifier];
					if (specification instanceof lychee.Specification) {
						this.specifications[identifier] = specification;
					}

				}


				return true;

			}


			return false;

		},

		setTarget: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				let pid = identifier.split('.')[0];
				let pkg = this.__packages[pid] || null;
				if (pkg !== null) {

					this.target = identifier;

					return true;
				}

			}


			return false;

		},

		setTimeout: function(timeout) {

			timeout = typeof timeout === 'number' ? (timeout | 0) : null;


			if (timeout !== null) {

				this.timeout = timeout;

				return true;

			}


			return false;

		}

	};


	return Composite;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

