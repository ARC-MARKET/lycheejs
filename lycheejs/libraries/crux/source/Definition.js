
lychee.Definition = typeof lychee.Definition !== 'undefined' ? lychee.Definition : (function(global) {

	const lychee = global.lychee;



	/*
	 * HELPERS
	 */

	const _DETECTOR_CACHE = {};
	const _WARNING_CACHE  = {};

	const _create_detector = function(platform) {

		platform = typeof platform === 'string' ? platform : null;


		if (platform !== null) {

			let sandbox = _DETECTOR_CACHE[platform] || null;
			if (sandbox === null) {

				if (platform.includes('-') === true) {

					let major = platform.split('-')[0];
					let minor = platform.split('-')[1];
					let clone = Object.assign({}, lychee.FEATURES[major], lychee.FEATURES[major + '-' + minor]);
					let proxy = _create_proxy(clone);
					if (proxy !== null) {
						sandbox = proxy;
					}

				} else {

					let clone = lychee.FEATURES[platform] || null;
					let proxy = _create_proxy(clone);
					if (proxy !== null) {
						sandbox = proxy;
					}

				}


				_DETECTOR_CACHE[platform] = sandbox;

			}


			return sandbox;

		}


		return null;

	};

	const _create_proxy = function(source, path) {

		path = typeof path === 'string' ? path : 'global';


		if (source === null) {
			return source;
		}


		if (typeof Proxy !== 'undefined') {

			let clone = {};
			let proxy = new Proxy(clone, {

				get: function(target, name) {

					// XXX: Remove this and console will crash the program
					if (name === 'splice') return undefined;


					if (target[name] === undefined) {

						let type = typeof source[name];
						if (/boolean|number|string|function/g.test(type)) {
							target[name] = source[name];
						} else if (/object/g.test(type)) {
							target[name] = _create_proxy(source[name], path + '.' + name);
						} else if (/undefined/g.test(type)) {
							target[name] = undefined;
						}


						if (target[name] === undefined) {

							let warned = _WARNING_CACHE[path + '.' + name] || false;
							if (warned === false) {
								_WARNING_CACHE[path + '.' + name] = true;
								console.warn('lychee.Definition: Unknown feature (data type) "' + path + '.' + name + '" in FEATURES.js');
							}

						}

					}


					return target[name];

				}

			});


			proxy.toJSON = function() {

				let data = {};

				Object.keys(clone).forEach(key => {

					if (/toJSON/g.test(key) === false) {

						let type = typeof clone[key];
						if (/boolean|number|string|function/g.test(type)) {
							data[key] = type;
						} else if (/object/g.test(type)) {
							data[key] = clone[key];
						}

					}

				});

				return data;

			};


			return proxy;

		}


		return source;

	};

	const _fuzz_asset = function(type) {

		let asset = {
			url:       '/tmp/Dummy.' + type,
			_is_dummy: true,
			serialize: function() {
				return null;
			}
		};


		let url = this.url;
		if (url !== null) {
			asset.url = url.split('.').slice(0, -1).join('.') + '.' + type;
		}


		Object.defineProperty(asset, 'buffer', {
			get: function() {
				return null;
			},
			set: function() {
				return false;
			},
			enumerable:   true,
			configurable: false
		});


		return asset;

	};

	const _fuzz_id = function() {

		let found = null;

		if (this.url !== null) {

			let namespace = null;

			for (let pid in lychee.environment.packages) {

				let pkg  = lychee.environment.packages[pid];
				let base = pkg.url.split('/').slice(0, -1).join('/');

				if (this.url.startsWith(base)) {
					namespace = pkg.id;
				}

			}


			if (namespace !== null) {

				let id    = '';
				let ns    = this.url.split('/');
				let tmp_i = ns.indexOf('source');
				let tmp_s = ns[ns.length - 1];

				if (/\.js$/g.test(tmp_s)) {
					ns[ns.length - 1] = tmp_s.split('.').slice(0, -1).join('.');
				}

				if (tmp_i !== -1 && ns[tmp_i + 1] === 'core') {

					if (ns[tmp_i + 2] === 'lychee') {
						ns.splice(tmp_i + 1, 2);
					} else {
						ns.splice(tmp_i + 1, 1);
					}

				}

				if (tmp_i !== -1) {
					id = ns.slice(tmp_i + 1).join('.');
				}

				if (id !== '') {
					found = namespace + '.' + id;
				} else {
					found = namespace;
				}

			}

		}

		return found;

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



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id  = '';
		this.url = lychee.FILENAME || null;

		this._attaches = {
			'json':  _fuzz_asset.call(this, 'json'),
			'fnt':   _fuzz_asset.call(this, 'fnt'),
			'msc':   _fuzz_asset.call(this, 'msc'),
			'pkg':   _fuzz_asset.call(this, 'pkg'),
			'png':   _fuzz_asset.call(this, 'png'),
			'snd':   _fuzz_asset.call(this, 'snd'),
			'store': _fuzz_asset.call(this, 'store')
		};
		this._tags     = {};
		this._requires = [];
		this._includes = [];
		this._exports  = null;
		this._supports = null;


		// XXX: url has to be set first for fuzzing
		this.setUrl(states.url);
		this.setId(states.id);


		this.tags(states.tags);
		this.requires(states.requires);
		this.includes(states.includes);
		this.supports(states.supports);
		this.exports(states.exports);


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.attaches instanceof Object) {

				let attachesmap = {};

				for (let aid in blob.attaches) {
					attachesmap[aid] = lychee.deserialize(blob.attaches[aid]);
				}

				this.attaches(attachesmap);

			}

			if (blob.tags instanceof Object) {
				this.tags(blob.tags);
			}

			if (blob.requires instanceof Array) {
				this.requires(blob.requires);
			}

			if (blob.includes instanceof Array) {
				this.includes(blob.includes);
			}


			if (typeof blob.supports === 'string') {

				// Function head
				let tmp = blob.exports.split('{')[0].trim();
				if (tmp.startsWith('function')) {
					tmp = tmp.substr('function'.length).trim();
				}

				if (tmp.startsWith('anonymous')) tmp = tmp.substr('anonymous'.length).trim();
				if (tmp.startsWith('('))         tmp = tmp.substr(1).trim();
				if (tmp.endsWith(')'))           tmp = tmp.substr(0, tmp.length - 1).trim();

				let bindargs = tmp.split(',').map(name => name.trim());
				let check    = bindargs[bindargs.length - 1];
				if (check.includes('\n')) {
					bindargs[bindargs.length - 1] = check.split('\n')[0];
				}


				// Function body
				let i1 = blob.supports.indexOf('{') + 1;
				let i2 = blob.supports.lastIndexOf('}') - 1;
				bindargs.push(blob.supports.substr(i1, i2 - i1));

				this.supports(Function.apply(Function, bindargs));

			}

			if (typeof blob.exports === 'string') {

				// Function head
				let tmp = blob.exports.split('{')[0].trim();
				if (tmp.startsWith('function')) {
					tmp = tmp.substr('function'.length).trim();
				}

				if (tmp.startsWith('anonymous')) tmp = tmp.substr('anonymous'.length).trim();
				if (tmp.startsWith('('))         tmp = tmp.substr(1).trim();
				if (tmp.endsWith(')'))           tmp = tmp.substr(0, tmp.length - 1).trim();

				let bindargs = tmp.split(',').map(name => name.trim());
				let check    = bindargs[bindargs.length - 1];
				if (check.includes('\n')) {
					bindargs[bindargs.length - 1] = check.split('\n')[0];
				}


				// Function body
				let i1 = blob.exports.indexOf('{') + 1;
				let i2 = blob.exports.lastIndexOf('}') - 1;
				bindargs.push(blob.exports.substr(i1, i2 - i1));

				this.exports(Function.apply(Function, bindargs));

			}

		},

		serialize: function() {

			let states = {};
			let blob   = {};


			if (this.id !== '')  states.id  = this.id;
			if (this.url !== '') states.url = this.url;


			if (Object.keys(this._attaches).length > 0) {

				blob.attaches = {};

				for (let aid in this._attaches) {

					let asset = this._attaches[aid];
					if (asset.url.startsWith('/tmp/Dummy') === false) {

						let data = lychee.serialize(asset);
						if (data !== null) {
							blob.attaches[aid] = data;
						}

					}

				}

			}

			if (Object.keys(this._tags).length > 0) {

				blob.tags = {};

				for (let tid in this._tags) {
					blob.tags[tid] = this._tags[tid];
				}

			}

			if (this._requires.length > 0)          blob.requires = this._requires.slice(0);
			if (this._includes.length > 0)          blob.includes = this._includes.slice(0);
			if (this._supports instanceof Function) blob.supports = this._supports.toString();
			if (this._exports instanceof Function)  blob.exports  = this._exports.toString();


			return {
				'constructor': 'lychee.Definition',
				'arguments':   [ states ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				if (id.includes('.') && /^([A-Za-z0-9-.]+)$/g.test(id)) {

					this.id = id;

					return true;

				} else {

					let fuzzed = _fuzz_id.call(this);
					if (fuzzed !== null) {

						this.id = fuzzed;

						console.warn('lychee.Definition: Injecting Identifier "' + fuzzed + '" ("' + this.url + '").');

						return true;

					} else {

						console.error('lychee.Definition: Invalid Identifier "' + id + '" ("' + this.url + '").');

					}

				}

			}


			return false;

		},

		setUrl: function(url) {

			url = typeof url === 'string' ? url : null;


			if (url !== null) {

				this.url = url;

				return true;

			}


			return false;

		},

		attaches: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (let id in map) {

					let value = map[id];
					if (value !== undefined) {
						this._attaches[id] = map[id];
					}

				}

			}


			return this;

		},

		check: function(target) {

			target = target instanceof Object ? target : {};


			let features  = null;
			let supported = true;
			let tagged    = true;


			for (let key in this._tags) {

				let tag = this._tags[key];
				let val = target[key] || null;
				if (val instanceof Array) {

					if (val.includes(tag) === false) {
						tagged = false;
						break;
					}

				} else if (typeof val === 'string') {

					if (val !== tag) {
						tagged = false;
						break;
					}

				}

			}


			if (this._supports !== null) {

				supported = false;


				let platform = this._tags.platform || null;
				if (platform !== null) {

					let detector = _create_detector(platform);
					if (detector !== null) {
						supported = this._supports.call(detector, lychee, detector);
						features  = JSON.parse(JSON.stringify(detector));
						detector  = null;
					} else {
						supported = this._supports.call(global, lychee, global);
					}

				} else {

					supported = this._supports.call(global, lychee, global);

				}

			}


			return {
				features:  features,
				supported: supported,
				tagged:    tagged
			};

		},

		export: function(sandbox) {

			sandbox = sandbox !== undefined ? sandbox : global;


			let check = _resolve.call(sandbox, this.id);
			if (check === null) {

				let console   = sandbox.console || global.console;
				let id        = this.id;
				let namespace = _resolve.call(sandbox, id.split('.').slice(0, -1).join('.'));
				let name      = id.split('.').pop();

				if (this._exports !== null) {

					let includes = this._includes.map(id => _resolve.call(sandbox, id));
					let requires = this._requires.map(id => _resolve.call(sandbox, id));

					if (includes.includes(null) === false && requires.includes(null) === false) {

						let template = null;

						try {

							template = this._exports.call(
								this._exports,
								sandbox.lychee,
								sandbox,
								this._attaches
							) || null;

						} catch (err) {
							lychee.Debugger.report(lychee.environment, err, this);
						}


						if (template !== null) {

							if (includes.length > 0) {

								let own_enums   = null;
								let own_methods = null;
								let own_keys    = Object.keys(template);
								let own_proto   = template.prototype;


								if (own_keys.length > 0) {

									own_enums = {};

									for (let ok = 0, okl = own_keys.length; ok < okl; ok++) {

										let own_key = own_keys[ok];
										if (own_key === own_key.toUpperCase()) {
											own_enums[own_key] = template[own_key];
										}

									}

									if (Object.keys(own_enums).length === 0) {
										own_enums = null;
									}

								}


								if (own_proto instanceof Object) {

									own_methods = {};

									for (let own_method in own_proto) {
										own_methods[own_method] = own_proto[own_method];
									}

									if (Object.keys(own_methods).length === 0) {
										own_methods = null;
									}

								}


								Object.defineProperty(namespace, name, {
									value:        template,
									writable:     false,
									enumerable:   true,
									configurable: false
								});

								namespace[name].displayName = id;
								namespace[name].prototype   = {};


								let tpl_enums   = {};
								let tpl_methods = [ namespace[name].prototype ];


								for (let i = 0, il = includes.length; i < il; i++) {

									let include  = includes[i];
									let inc_keys = Object.keys(include);
									if (inc_keys.length > 0) {

										for (let ik = 0, ikl = inc_keys.length; ik < ikl; ik++) {

											let inc_key = inc_keys[ik];
											if (inc_key === inc_key.toUpperCase()) {
												tpl_enums[inc_key] = include[inc_key];
											}

										}

									}

									tpl_methods.push(include.prototype);

								}


								if (own_enums !== null) {

									for (let e in own_enums) {
										tpl_enums[e] = own_enums[e];
									}

								}

								if (own_methods !== null) {
									tpl_methods.push(own_methods);
								}

								for (let e in tpl_enums) {
									namespace[name][e] = tpl_enums[e];
								}


								Object.assign.apply(lychee, tpl_methods);
								namespace[name].prototype.displayName = id;

								Object.freeze(namespace[name].prototype);


								return true;

							} else {

								namespace[name]             = template;
								namespace[name].displayName = id;


								if (template instanceof Object) {
									Object.freeze(namespace[name]);
								}

								if (namespace[name].prototype instanceof Object) {
									namespace[name].prototype.displayName = id;
									Object.freeze(namespace[name].prototype);
								}


								return true;

							}

						} else {

							namespace[name]                       = function() {
								console.warn('Dummy Composite: Replace me with a real Definition!');
							};
							namespace[name].displayName           = id;
							namespace[name].prototype             = {};
							namespace[name].prototype.displayName = id;

							Object.freeze(namespace[name].prototype);

							console.warn('lychee.Definition ("' + id + '"): Invalid Definition, replaced with Dummy Composite.');


							return true;

						}

					} else {

						let invalid_includes = this._includes.filter((id, i) => includes[i] === null);
						if (invalid_includes.length > 0) {

							for (let i = 0, il = invalid_includes.length; i < il; i++) {
								let tmp = invalid_includes[i];
								console.error('lychee.Definition ("' + id + '"): Invalid Inclusion of "' + tmp + '".');
							}

						}


						let invalid_requires = this._requires.filter((id, r) => requires[r] === null);
						if (invalid_requires.length > 0) {

							for (let i = 0, il = invalid_requires.length; i < il; i++) {
								let tmp = invalid_requires[i];
								console.error('lychee.Definition ("' + id + '"): Invalid Requirement of "' + tmp + '".');
							}

						}

					}

				}


				return false;

			}


			return true;

		},

		exports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {

				let check = (callback).toString().split('{')[0];
				if (check.includes('\n')) {
					check = check.split('\n').join('');
				}

				if (check.includes('(lychee, global, attachments)') || check.includes('(lychee,global,attachments)')) {
					this._exports = callback;
				} else {
					console.error('lychee.Definition ("' + this.id + '"): Invalid exports callback.');
					console.info('lychee.Definition ("' + this.id + '"): Use lychee.define(id).exports(function(lychee, global, attachments) {}).');
				}

			}


			return this;

		},

		includes: function(definitions) {

			definitions = definitions instanceof Array ? definitions : null;


			if (definitions !== null) {

				for (let d = 0, dl = definitions.length; d < dl; d++) {

					let definition = definitions[d];
					if (typeof definition === 'string') {

						let is_definition = definition.includes('.');
						if (is_definition === true) {

							if (this._includes.includes(definition) === false) {
								this._includes.push(definition);
							}

						}

					} else {
						console.warn('lychee.Definition ("' + this.id + '"): Invalid Inclusion #' + d + '.');
					}

				}

			}


			return this;

		},

		requires: function(definitions) {

			definitions = definitions instanceof Array ? definitions : null;


			if (definitions !== null) {

				for (let d = 0, dl = definitions.length; d < dl; d++) {

					let definition = definitions[d];
					if (typeof definition === 'string') {

						let is_definition = definition.includes('.');
						if (is_definition === true) {

							if (this._requires.includes(definition) === false) {
								this._requires.push(definition);
							}

						}

					} else {
						console.warn('lychee.Definition ("' + this.id + '"): Invalid Requirement #' + d + '.');
					}

				}

			}


			return this;

		},

		supports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {

				let check = (callback).toString().split('{')[0];
				if (check.includes('\n')) {
					check = check.split('\n').join('');
				}

				if (check.includes('(lychee, global)') || check.includes('(lychee,global')) {
					this._supports = callback;
				} else {
					console.error('lychee.Definition ("' + this.id + '"): Invalid supports callback.');
					console.info('lychee.Definition ("' + this.id + '"): Use lychee.specify(id).supports(function(lychee, global) {}).');
				}

			}


			return this;

		},

		tags: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (let tag in map) {

					let val = map[tag];
					if (typeof val === 'string') {
						this._tags[tag] = val;
					} else {
						console.warn('lychee.Definition ("' + this.id + '"): Invalid Tag "' + tag + '".');
					}

				}

			}


			return this;

		}

	};


	Composite.displayName           = 'lychee.Definition';
	Composite.prototype.displayName = 'lychee.Definition';


	return Composite;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

