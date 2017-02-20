
lychee.Package = typeof lychee.Package !== 'undefined' ? lychee.Package : (function(global) {

	const lychee = global.lychee;


	/*
	 * HELPERS
	 */

	const _resolve_root = function() {

		let root = this.root;
		let type = this.type;
		if (type === 'source') {
			root += '/source';
		} else if (type === 'export') {
			root += '/source';
		} else if (type === 'build') {
			root += '/build';
		}


		return root;

	};

	const _resolve_path = function(candidate) {

		let path = typeof candidate === 'string' ? candidate.split('/') : null;


		if (path !== null) {

			let type = this.type;
			if (type === 'export') {
				type = 'source';
			}


			let pointer = this.__config.buffer[type].files || null;
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


			return pointer !== null ? true : false;

		}


		return false;

	};

	const _resolve_attachments = function(candidate) {

		let attachments = {};
		let path        = candidate.split('/');
		if (path.length > 0) {

			let pointer = this.__config.buffer.source.files || null;
			if (pointer !== null) {

				for (let pa = 0, pal = path.length; pa < pal; pa++) {

					let name = path[pa];
					if (pointer[name] !== undefined) {
						pointer = pointer[name];
					} else {
						pointer = null;
						break;
					}

				}


				if (pointer !== null && pointer instanceof Array) {

					let classpath = _resolve_root.call(this) + '/' + path.join('/');

					for (let po = 0, pol = pointer.length; po < pol; po++) {

						let type = pointer[po];
						if (type !== 'js') {
							attachments[type] = classpath + '.' + type;
						}

					}

				}

			}

		}


		return attachments;

	};

	const _resolve_candidates = function(id, tags) {

		tags = tags instanceof Object ? tags : null;


		let that          = this;
		let candidatepath = id.split('.').join('/');
		let candidates    = [];
		let filter_values = function(tags, tag) {

			return tags[tag].map(function(value) {
				return _resolve_tag.call(that, tag, value) + '/' + candidatepath;
			}).filter(function(path) {
				return _resolve_path.call(that, path);
			});

		};


		if (tags !== null) {

			for (let tag in tags) {

				let values = filter_values(tags, tag);
				if (values.length > 0) {
					candidates.push.apply(candidates, values);
				}

			}

		}


		if (_resolve_path.call(this, candidatepath) === true) {
			candidates.push(candidatepath);
		}


		return candidates;

	};

	const _resolve_tag = function(tag, value) {

		tag   = typeof tag === 'string'   ? tag   : null;
		value = typeof value === 'string' ? value : null;


		if (tag !== null && value !== null) {

			let type = this.type;
			if (type === 'export') {
				type = 'source';
			}


			let pointer = this.__config.buffer[type].tags || null;
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

	const _load_candidate = function(id, candidates) {

		if (candidates.length > 0) {

			let map = {
				id:           id,
				candidate:    null,
				candidates:   [].concat(candidates),
				attachments:  [],
				dependencies: [],
				loading:      1
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

		let that       = this;
		let identifier = this.id + '.' + map.id;


		implementation.onload = function(result) {

			map.loading--;


			if (result === true) {

				let environment = that.environment;
				let definition  = environment.definitions[identifier] || null;
				if (definition !== null) {

					map.candidate = this;


					let attachmentIds = Object.keys(attachments);


					// Temporary delete definition from environment and re-define it after attachments are all loaded
					if (attachmentIds.length > 0) {

						delete environment.definitions[identifier];

						map.loading += attachmentIds.length;


						attachmentIds.forEach(function(assetId) {

							let url   = attachments[assetId];
							let asset = new lychee.Asset(url);
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


					return true;

				}

			}



			// If code runs through here, candidate was invalid
			delete that.environment.definitions[identifier];
			that.__blacklist[candidate] = 1;

			// Load next candidate, if any available
			if (map.candidates.length > 0) {
				_load_candidate.call(that, map.id, map.candidates);
			}

		};

		implementation.load();

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(id, url) {

		id  = typeof id === 'string'  ? id  : 'app';
		url = typeof url === 'string' ? url : null;


		// This is public to allow loading packages
		// as external renamespaced libraries

		this.id   = id;
		this.url  = null;
		this.root = null;

		this.environment = null;
		this.type        = 'source';

		this.__blacklist = {};
		this.__config    = null;
		this.__requests  = {};


		if (url !== null) {

			let that = this;
			let tmp  = url.split('/');

			let file = tmp.pop();
			if (file === 'lychee.pkg') {

				this.root = tmp.join('/');
				this.url  = url;

				this.__config = new Config(this.url);
				this.__config.onload = function(result) {

					if (that.isReady() === false) {
						result = false;
					}


					if (result === true) {
						console.info('lychee.Package-' + that.id + ': Package at "' + this.url + '" ready.');
					} else {
						console.error('lychee.Package-' + that.id + ': Package at "' + this.url + '" corrupt.');
					}

				};
				this.__config.load();

			}

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.Package',
				'arguments':   [ this.id, this.url ]
			};

		},



		/*
		 * CUSTOM API
		 */

		isReady: function() {

			let ready  = false;
			let config = this.__config;

			if (config !== null && config.buffer !== null) {

				if (config.buffer.source instanceof Object && config.buffer.build instanceof Object) {
					ready = true;
				}

			}


			return ready;

		},

		load: function(id, tags) {

			id   = typeof id === 'string' ? id   : null;
			tags = tags instanceof Object ? tags : null;


			if (id !== null && this.isReady() === true) {

				let request = this.__requests[id] || null;
				if (request === null) {

					let candidates = _resolve_candidates.call(this, id, tags);
					if (candidates.length > 0) {

						_load_candidate.call(this, id, candidates);

						return true;

					} else {

						let info = Object.keys(tags).length > 0 ? ('(' + JSON.stringify(tags) + ')') : '';
						console.error('lychee.Package-' + this.id + ': Invalid Definition "' + id + '" ' + info);

						return false;

					}

				} else {

					return true;

				}

			}


			return false;

		},

		setEnvironment: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			if (environment !== null) {

				this.environment = environment;

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = typeof type === 'string' ? type : null;


			if (type !== null) {

				if (type === 'source' || type === 'export' || type === 'build') {

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

