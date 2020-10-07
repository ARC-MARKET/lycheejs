
lychee.Package = typeof lychee.Package !== 'undefined' ? lychee.Package : (function(global) {

	const lychee = global.lychee;


	/*
	 * HELPERS
	 */

	const _fuzz_id = function() {

		let found = null;

		if (this.url !== null) {

			let url = this.url;
			if (url.includes('/libraries/')) {

				let ns    = url.split('/');
				let tmp_i = ns.indexOf('libraries');
				let tmp_s = ns[tmp_i + 1] || '';

				if (tmp_s !== '') {
					found = tmp_s;
				}

			}

		}

		return found;

	};

	const _resolve_root = function() {

		let root = this.root;
		let type = this.type;

		if (type === 'api') {
			root += '/api';
		} else if (type === 'build') {
			root += '/build';
		} else if (type === 'review') {
			root += '/review';
		} else if (type === 'source') {
			root += '/source';
		}

		return root;

	};

	const _CORE_MAP = {
		'':              'lychee',
		'Asset':         'Asset',
		'Debugger':      'Debugger',
		'Definition':    'Definition',
		'Environment':   'Environment',
		'Package':       'Package',
		'Simulation':    'Simulation',
		'Specification': 'Specification'
	};

	const _resolve_path = function(candidate) {

		let config = this.config;
		let path   = typeof candidate === 'string' ? candidate.split('/') : null;

		if (config !== null && path !== null) {

			let pointer = config.buffer[this.type].files || null;

			if (pointer !== null) {

				for (let p = 0, pl = path.length; p < pl; p++) {

					let name = path[p];
					if (pointer[name] !== undefined) {
						pointer = pointer[name];
					} else {
						pointer = null;
						break;
					}

				}

			}

			return pointer;

		}


		return null;

	};

	const _resolve_attachments = function(candidate) {

		let config      = this.config;
		let attachments = {};

		if (config !== null) {

			let pointer = _resolve_path.call(this, candidate);
			if (pointer !== null && pointer instanceof Array) {

				let definition_path = _resolve_root.call(this) + '/' + candidate;

				for (let po = 0, pol = pointer.length; po < pol; po++) {

					let type = pointer[po];
					if (type !== 'js') {
						attachments[type] = definition_path + '.' + type;
					}

				}

			}

		}

		return attachments;

	};

	const _resolve_candidates = function(id, tags) {

		tags = tags instanceof Object ? tags : null;


		let candidatepath = id.split('.').join('/');
		let candidates    = [];

		if (tags !== null) {

			for (let tag in tags) {

				let values = [];

				if (tags[tag] instanceof Array) {

					let prefixes = tags[tag].map(value => _resolve_tag.call(this, tag, value)).filter(prefix => prefix !== '');
					if (prefixes.length > 0) {

						prefixes.forEach(prefix => {

							let path = _resolve_path.call(this, prefix + '/' + candidatepath);
							if (path !== null) {
								values.push(prefix + '/' + candidatepath);
							}

						});

					}

				} else if (typeof tags[tag] === 'string') {

					let prefix = _resolve_tag.call(this, tag, tags[tag]);
					if (prefix !== '') {

						let path = _resolve_path.call(this, prefix + '/' + candidatepath);
						if (path !== null) {
							values.push(prefix + '/' + candidatepath);
						}

					}

				}

				if (values.length > 0) {
					candidates.push.apply(candidates, values);
				}

			}

		}


		let core_path = _CORE_MAP[candidatepath] || null;
		if (core_path !== null && this.id === 'lychee' && this.type !== 'source') {

			candidates.push(core_path);

		} else {

			if (_resolve_path.call(this, candidatepath) !== null) {
				candidates.push(candidatepath);
			}

		}


		return candidates;

	};

	const _resolve_namespaces = function(node, namespaces, path) {

		namespaces = namespaces instanceof Array ? namespaces : [];
		path       = typeof path === 'string'    ? path       : '';


		if (node instanceof Array) {

			// Ignore Arrays specifically

		} else if (node instanceof Object) {

			if (path !== '' && namespaces.includes(path) === false) {
				namespaces.push(path);
			}

			Object.keys(node).forEach(child => {

				if (child.includes('__') === false) {

					if (node[child] instanceof Array) {
						// Ignore Arrays specifically
					} else {
						_resolve_namespaces(node[child], namespaces, (path !== '' ? (path + '.') : '') + child);
					}

				}

			});

		}

	};

	const _resolve_files = function(node, files, path, extensions) {

		files      = files instanceof Array   ? files : [];
		path       = typeof path === 'string' ? path  : '';
		extensions = extensions === true;


		if (node instanceof Array) {

			if (extensions === true) {

				for (let n = 0, nl = node.length; n < nl; n++) {
					files.push(path + '.' + node[n]);
				}

			} else {

				files.push(path);

			}

		} else if (node instanceof Object) {

			Object.keys(node).forEach(child => {

				if (child.includes('__') === false) {
					_resolve_files(node[child], files, path + '/' + child, extensions);
				}

			});

		}

		return files;

	};

	const _resolve_tag = function(tag, value) {

		tag   = typeof tag === 'string'   ? tag   : null;
		value = typeof value === 'string' ? value : null;


		let config = this.config;

		if (config !== null && tag !== null && value !== null) {

			let pointer = config.buffer[this.type].tags || null;
			if (pointer !== null) {

				if (pointer[tag] instanceof Object) {

					let path = pointer[tag][value] || null;
					if (path !== null) {
						return path;
					}

				}

			}

		}


		return '';

	};

	const _sort_by_tag = function(a, b) {

		let rank_a = 0;
		let rank_b = 0;

		let check_a = a.includes('-');
		let check_b = b.includes('-');

		if (check_a && check_b) {

			let tmp_a = a.split('-');
			let tmp_b = b.split('-');

			if (tmp_a[0] > tmp_b[0]) rank_a += 3;
			if (tmp_b[0] > tmp_a[0]) rank_b += 3;

			if (tmp_a[0] === tmp_b[0]) {
				if (tmp_a[1] > tmp_b[1]) rank_a += 1;
				if (tmp_b[1] > tmp_a[1]) rank_b += 1;
			}

		} else if (check_a && !check_b) {

			let tmp_a = a.split('-');

			if (tmp_a[0] > b)   rank_a += 3;
			if (b > tmp_a[0])   rank_b += 3;
			if (tmp_a[0] === b) rank_b += 1;

		} else if (!check_a && check_b) {

			let tmp_b = b.split('-');

			if (a > tmp_b[0])   rank_a += 3;
			if (tmp_b[0] > a)   rank_b += 3;
			if (a === tmp_b[0]) rank_a += 1;

		} else {

			if (a > b) rank_a += 3;
			if (b > a) rank_b += 3;

		}

		if (rank_a > rank_b) return  1;
		if (rank_b > rank_a) return -1;
		return 0;

	};

	const _validate_env_tags = function(source_tags, target_tags) {

		for (let tag in source_tags) {

			let source_value = source_tags[tag];
			let target_value = target_tags[tag] || null;
			if (target_value !== null) {

				if (source_value instanceof Array && target_value instanceof Array) {

					let valid = true;

					for (let t = 0, tl = target_value.length; t < tl; t++) {

						let check = source_value.includes(target_value[t]);
						if (check === false) {
							valid = false;
							break;
						}

					}

					if (valid === false) {
						return false;
					}

				} else if (source_value instanceof Array && typeof target_value === 'string') {

					let check = source_value.includes(target_value);
					if (check === false) {
						return false;
					}

				} else if (typeof source_value === 'string' && typeof target_value === 'string') {

					let check = source_value === target_value;
					if (check === false) {
						return false;
					}

				} else if (typeof source_value === 'string' && target_value instanceof Array) {

					let check = target_value.includes(source_value);
					if (check === false) {
						return false;
					}

				}

			}

		}


		return true;

	};

	const _load_candidate = function(id, candidates) {

		if (candidates.length > 0) {

			let map = {
				id:           id,
				candidate:    null,
				candidates:   Array.from(candidates),
				attachments:  [],
				dependencies: [],
				loading:      1,
				type:         this.type
			};


			this.__requests[id] = map;


			let candidate = map.candidates.shift();

			while (candidate !== undefined) {

				if (this.__blacklist[candidate] === 1) {
					candidate = map.candidates.shift();
				} else {
					break;
				}

			}


			// Try to load the first suggested Candidate Implementation
			if (candidate !== undefined) {

				let url            = _resolve_root.call(this) + '/' + candidate + '.js';
				let implementation = new lychee.Asset(url, null, false);
				let attachments    = _resolve_attachments.call(this, candidate);

				if (implementation !== null) {
					_load_candidate_implementation.call(this, candidate, implementation, attachments, map);
				}

			}

		}

	};

	const _load_candidate_implementation = function(candidate, implementation, attachments, map) {

		let type       = map.type;
		let identifier = this.id + '.' + map.id;
		if (identifier.endsWith('.')) {
			identifier = identifier.substr(0, identifier.length - 1);
		}


		implementation.onload = result => {

			map.loading--;


			if (result === true) {

				if (type === 'export' || type === 'source') {

					let environment = this.environment || null;
					if (environment !== null) {

						let definition = environment.definitions[identifier] || null;
						if (definition !== null) {

							map.candidate = this;


							let attachment_ids = Object.keys(attachments);
							if (attachment_ids.length > 0) {

								// Temporarily remove definition to prevent misusage
								delete environment.definitions[identifier];

								map.loading += attachment_ids.length;


								attachment_ids.forEach(assetId => {

									let url   = attachments[assetId];
									let asset = new lychee.Asset(url, null, true);
									if (asset !== null) {

										asset.onload = function(result) {

											map.loading--;

											let tmp = {};
											if (result === true) {
												tmp[assetId] = this;
											} else {
												tmp[assetId] = null;
											}

											definition.attaches(tmp);


											if (map.loading === 0) {
												environment.definitions[identifier] = definition;
											}

										};

										asset.load();

									} else {

										map.loading--;

									}

								});

							}


							for (let i = 0, il = definition._includes.length; i < il; i++) {
								environment.load(definition._includes[i]);
							}

							for (let r = 0, rl = definition._requires.length; r < rl; r++) {
								environment.load(definition._requires[r]);
							}

						} else {

							// Invalid Definition format
							delete environment.definitions[identifier];

						}

					}

				} else if (type === 'review') {

					let simulation = this.simulation || null;
					if (simulation !== null) {

						let specification = simulation.specifications[identifier] || null;
						if (specification !== null) {

							for (let r = 0, rl = specification._requires.length; r < rl; r++) {
								simulation.load(specification._requires[r]);
							}

						} else {

							// Invalid Specification format
							delete simulation.specifications[identifier];

						}

					}

				}

			}


			this.__blacklist[candidate] = 1;

			// Load next candidate, if any available
			if (map.candidates.length > 0) {
				_load_candidate.call(this, map.id, map.candidates);
			}

		};

		implementation.load();

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id          = 'app';
		this.config      = null;
		this.environment = null;
		this.root        = null;
		this.simulation  = null;
		this.type        = 'source';
		this.url         = null;

		this.__blacklist = {};
		this.__requests  = {};
		this.__warnings  = {};


		let check = states.id || null;
		if (check !== null && /^([a-z]+)$/g.test(check)) {
			this.setId(states.id);
			this.setUrl(states.url);
		} else {
			this.setUrl(states.url);
			this.setId(states.id);
		}


		this.setEnvironment(states.environment);
		this.setSimulation(states.simulation);
		this.setType(states.type);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.config instanceof Object) {
				this.config = lychee.deserialize(blob.config);
			}

		},

		serialize: function() {

			let states = {};
			let blob   = {};


			if (this.id !== '')         states.id   = this.id;
			if (this.type !== 'source') states.type = this.type;
			if (this.url !== '')        states.url  = this.url;


			if (this.config !== null) {
				blob.config = lychee.serialize(this.config);
			}


			return {
				'constructor': 'lychee.Package',
				'arguments':   [ states ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		getDefinitions: function(tags) {

			tags = tags instanceof Object ? tags : null;


			let filtered = [];

			let config = this.config || null;
			if (config !== null) {

				let buffer = config.buffer || null;
				if (buffer !== null) {

					let files = [];
					let type  = this.type;
					let root  = buffer[type].files || null;

					if (root !== null) {
						_resolve_files(root, files, '', false);
					}

					if (tags !== null) {

						for (let tag in tags) {

							if (tags[tag] instanceof Array) {

								for (let t = 0, tl = tags[tag].length; t < tl; t++) {

									let value  = tags[tag][t];
									let prefix = _resolve_tag.call(this, tag, value);

									for (let f = 0, fl = files.length; f < fl; f++) {

										let file = files[f];
										if (file.startsWith('/' + prefix + '/')) {

											let id = file.substr(1 + prefix.length + 1).split('/').join('.');
											if (filtered.includes(id) === false) {
												filtered.push(id);
											}

										}

									}

								}

							} else if (typeof tags[tag] === 'string') {

								let value  = tags[tag];
								let prefix = _resolve_tag.call(this, tag, value);

								for (let f = 0, fl = files.length; f < fl; f++) {

									let file = files[f];
									if (file.startsWith('/' + prefix + '/')) {

										let id = file.substr(1 + prefix.length + 1).split('/').join('.');
										if (filtered.includes(id) === false) {
											filtered.push(id);
										}

									}

								}

							}

						}

					} else {

						let tags     = [];
						let prefixes = [];
						let pointer  = config.buffer[this.type].tags || null;
						if (pointer !== null) {

							for (let tag in pointer) {

								tags.push(tag);


								let pkg_tags = pointer[tag];
								if (pkg_tags instanceof Object) {

									for (let id in pkg_tags) {

										let prefix = pkg_tags[id] || null;
										if (prefix !== null) {
											prefixes.push(prefix);
										}

									}

								}

							}

						}


						for (let f = 0, fl = files.length; f < fl; f++) {

							let file = files[f];

							for (let p = 0, pl = prefixes.length; p < pl; p++) {

								let prefix = prefixes[p];

								if (file.startsWith('/' + prefix + '/')) {

									let id = file.substr(1 + prefix.length + 1).split('/').join('.');
									if (filtered.includes(id) === false) {
										filtered.push(id);
									}

								} else {

									let untagged = true;

									for (let t = 0, tl = tags.length; t < tl; t++) {

										let tag = tags[t];

										if (file.startsWith('/' + tag)) {
											untagged = false;
											break;
										}

									}

									if (untagged === true) {

										let id = file.substr(1).split('/').join('.');
										if (filtered.includes(id) === false) {
											filtered.push(id);
										}

									}

								}

							}

						}

					}

				}

			}

			filtered = filtered.sort();


			return filtered;

		},

		getEnvironments: function(tags) {

			tags = tags instanceof Object ? tags : null;


			let filtered = [];

			let config = this.config || null;
			if (config !== null) {

				let buffer = config.buffer || null;
				if (buffer !== null) {

					let type         = this.type;
					let environments = buffer[type].environments || null;

					if (environments !== null) {

						for (let id in environments) {

							let environment = lychee.assignunlink({
								id: id
							}, environments[id]);


							if (tags !== null) {

								let valid = _validate_env_tags(environment.tags || {}, tags);
								if (valid === true) {
									filtered.push(environment);
								}

							} else {

								filtered.push(environment);

							}

						}

					}

				}

			}

			filtered = filtered.sort((a, b) => _sort_by_tag(a.id, b.id));


			return filtered;

		},

		getFiles: function(tags) {

			tags = tags instanceof Object ? tags : null;


			let filtered = [];

			let config = this.config || null;
			if (config !== null) {

				let buffer = config.buffer || null;
				if (buffer !== null) {

					let files = [];
					let type  = this.type;
					let root  = buffer[type].files || null;

					if (root !== null) {
						_resolve_files(root, files, '', true);
					}

					if (tags !== null) {

						for (let tag in tags) {

							if (tags[tag] instanceof Array) {

								for (let t = 0, tl = tags[tag].length; t < tl; t++) {

									let value  = tags[tag][t];
									let prefix = _resolve_tag.call(this, tag, value);

									for (let f = 0, fl = files.length; f < fl; f++) {

										let file = files[f];
										if (file.startsWith('/' + prefix + '/')) {
											filtered.push(file.substr(1));
										}

									}

								}

							} else if (typeof tags[tag] === 'string') {

								let value  = tags[tag];
								let prefix = _resolve_tag.call(this, tag, value);

								for (let f = 0, fl = files.length; f < fl; f++) {

									let file = files[f];
									if (file.startsWith('/' + prefix + '/')) {
										filtered.push(file.substr(1));
									}

								}

							}

						}

					} else {

						for (let f = 0, fl = files.length; f < fl; f++) {
							filtered.push(files[f].substr(1));
						}

					}

				}

			}

			filtered = filtered.sort();


			return filtered;

		},

		getNamespaces: function(tags) {

			tags = tags instanceof Object ? tags : null;


			let filtered = [];

			let config = this.config || null;
			if (config !== null) {

				let buffer = config.buffer || null;
				if (buffer !== null) {

					let namespaces = [];
					let type       = this.type;
					let root       = buffer[type].files || null;

					if (root !== null) {
						_resolve_namespaces(root, namespaces, '');
					}

					if (tags !== null) {

						for (let tag in tags) {

							if (tags[tag] instanceof Array) {

								for (let t = 0, tl = tags[tag].length; t < tl; t++) {

									let value  = tags[tag][t];
									let prefix = _resolve_tag.call(this, tag, value).split('/').join('.');

									for (let n = 0, nl = namespaces.length; n < nl; n++) {

										let namespace = namespaces[n];
										if (namespace.startsWith(prefix + '.')) {

											let id = namespace.substr(prefix.length + 1);
											if (filtered.includes(id) === false) {
												filtered.push(id);
											}

										}

									}

								}

							} else if (typeof tags[tag] === 'string') {

								let value  = tags[tag];
								let prefix = _resolve_tag.call(this, tag, value).split('/').join('.');

								for (let n = 0, nl = namespaces.length; n < nl; n++) {

									let namespace = namespaces[n];
									if (namespace.startsWith(prefix + '.')) {

										let id = namespace.substr(prefix.length + 1);
										if (filtered.includes(id) === false) {
											filtered.push(id);
										}

									}

								}

							}

						}

					} else {

						let tags     = [];
						let prefixes = [];
						let pointer  = config.buffer[this.type].tags || null;
						if (pointer !== null) {

							for (let tag in pointer) {

								tags.push(tag);


								let pkg_tags = pointer[tag];
								if (pkg_tags instanceof Object) {

									for (let id in pkg_tags) {

										let prefix = pkg_tags[id] || null;
										if (prefix !== null) {
											prefixes.push(prefix.split('/').join('.'));
										}

									}

								}

							}

						}


						for (let n = 0, nl = namespaces.length; n < nl; n++) {

							let namespace = namespaces[n];

							for (let p = 0, pl = prefixes.length; p < pl; p++) {

								let prefix = prefixes[p];

								if (namespace.startsWith(prefix + '.')) {

									let id = namespace.substr(prefix.length + 1);
									if (filtered.includes(id) === false) {
										filtered.push(id);
									}

								} else {

									let untagged = true;

									for (let t = 0, tl = tags.length; t < tl; t++) {

										let tag = tags[t];

										if (namespace.startsWith(tag)) {
											untagged = false;
											break;
										}

									}

									if (untagged === true) {

										let id = namespace;
										if (filtered.includes(id) === false) {
											filtered.push(id);
										}

									}

								}

							}

						}

					}

				}

			}

			filtered = filtered.sort();


			return filtered;

		},

		getSimulations: function(tags) {

			tags = tags instanceof Object ? tags : null;


			let filtered = [];

			let config = this.config || null;
			if (config !== null) {

				let buffer = config.buffer || null;
				if (buffer !== null) {

					let type        = this.type;
					let simulations = buffer[type].simulations || null;

					if (simulations !== null) {

						for (let id in simulations) {

							let simulation = lychee.assignunlink({
								id: id
							}, simulations[id]);


							let environment = simulation.environment || null;
							if (environment instanceof Object && tags !== null) {

								let valid = _validate_env_tags(environment.tags || {}, tags);
								if (valid === true) {
									filtered.push(simulation);
								}

							} else {

								filtered.push(simulation);

							}

						}

					}

				}

			}

			filtered = filtered.sort((a, b) => _sort_by_tag(a.id, b.id));


			return filtered;

		},

		load: function(id, tags) {

			id   = typeof id === 'string' ? id   : null;
			tags = tags instanceof Object ? tags : null;


			let config = this.config;

			if (id !== null && config !== null) {

				let request = this.__requests[id] || null;
				if (request === null) {

					let candidates = _resolve_candidates.call(this, id, tags);
					if (candidates.length > 0) {

						_load_candidate.call(this, id, candidates);

						return true;

					} else {

						let check = this.__warnings[id] || null;
						if (check === null) {

							if (tags !== null) {
								let info = Object.keys(tags).length > 0 ? (' (' + JSON.stringify(tags) + ').') : '.';
								console.error('lychee.Package ("' + this.id + '"): Invalid Definition "' + id + '"' + info);
							} else {
								console.error('lychee.Package ("' + this.id + '"): Invalid Definition "' + id + '".');
							}

							this.__warnings[id] = 1;

						}

						return false;

					}

				} else {

					return true;

				}

			}


			return false;

		},

		resolve: function(id, tags) {

			id   = typeof id === 'string' ? id   : null;
			tags = tags instanceof Object ? tags : null;


			let config   = this.config;
			let filtered = [];

			if (id !== null && config !== null) {

				let candidates = _resolve_candidates.call(this, id, tags);
				if (candidates.length > 0) {

					for (let c = 0, cl = candidates.length; c < cl; c++) {
						filtered.push(candidates[c]);
					}

				}

			}

			return filtered;

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && /^([a-z]+)$/g.test(id)) {

				this.id = id;

				return true;

			} else {

				let fuzzed = _fuzz_id.call(this);
				if (fuzzed !== null) {

					this.id = fuzzed;

					console.warn('lychee.Package: Injecting Identifier "' + fuzzed + '" ("' + this.url + '").');

					return true;

				} else if (id !== null) {

					console.error('lychee.Package: Invalid Identifier "' + id + '" ("' + this.url + '").');

				}

			}


			return false;

		},

		setUrl: function(url) {

			url = typeof url === 'string' ? url : null;


			if (url !== null && url.endsWith('/lychee.pkg')) {

				this.config = null;
				this.root   = url.split('/').slice(0, -1).join('/');
				this.url    = url;


				let config = new Config(url);

				config.onload = result => {

					let buffer = config.buffer || null;
					if (
						buffer !== null
						&& buffer instanceof Object
						&& buffer.build instanceof Object
						&& buffer.review instanceof Object
						&& buffer.source instanceof Object
					) {

						console.info('lychee.Package ("' + this.id + '"): Config "' + config.url + '" ready.');

						this.config = config;

					} else {

						console.error('lychee.Package ("' + this.id + '"): Config "' + config.url + '" corrupt.');

					}

				};

				config.load();


				return true;

			}


			return false;

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;

				return true;

			} else {

				this.environment = null;

			}


			return false;

		},

		setSimulation: function(simulation) {

			simulation = simulation instanceof lychee.Simulation ? simulation : null;


			if (simulation !== null) {

				this.simulation = simulation;

				return true;

			} else {

				this.simulation = null;

			}


			return false;

		},

		setType: function(type) {

			type = typeof type === 'string' ? type : null;


			if (type !== null) {

				if (/^(api|build|review|source)$/g.test(type)) {

					this.type = type;

					return true;

				}

			}


			return false;

		}

	};


	Composite.displayName           = 'lychee.Package';
	Composite.prototype.displayName = 'lychee.Package';


	return Composite;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

