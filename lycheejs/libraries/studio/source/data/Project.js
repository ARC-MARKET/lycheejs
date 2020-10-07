
lychee.define('studio.data.Project').exports((lychee, global, attachments) => {

	const _DEFAULT_SETTINGS = {
		'debug': false,
		'packages': {
			'app': './lychee.pkg'
		},
		'sandbox': false,
		'tags': {
			'platform': []
		},
		'target': 'app.Main',
		'variant': 'application',
		'profile': {}
	};



	/*
	 * HELPERS
	 */

	const _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			for (let n = 0, nl = node.length; n < nl; n++) {
				files.push(path + '.' + node[n]);
			}

		} else if (node instanceof Object) {

			for (let child in node) {
				_walk_directory(files, node[child], path + '/' + child);
			}

		}

	};

	const _package_files = function(json) {

		let files = [];

		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '');
			}

		}


		return files.map(value => value.substr(1)).sort((a, b) => {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		}).filter(value => value.includes('__') === false);

	};

	const _set_platform = function(platform, value) {

		let id           = /^\/libraries\//g.test(this.identifier) ? 'dist' : 'main';
		let environments = this.config.buffer.build.environments;


		if (value === true) {

			if (environments[platform + '/' + id] === undefined) {

				let namespace = this.__target.split('.')[0];
				let packages  = this.__packages;
				let platforms = [];
				let settings  = lychee.assignunlink({}, _DEFAULT_SETTINGS);
				let target    = this.__target;


				let pkg = packages[namespace] || null;
				if (pkg === null) {
					packages[namespace] = './lychee.pkg';
				}


				if (/-/.test(platform) === true) {

					platforms.push(platform);
					platforms.push(platform.split('-')[0]);

				} else {

					platforms.push(platform);

				}


				if (id === 'main') {

					settings.packages      = packages;
					settings.tags.platform = platforms;
					settings.target        = target;
					settings.variant       = 'application';
					settings.profile       = {
						client: platform !== 'node' ? '/api/server/connect?identifier=' + this.identifier : null
					};

				} else {

					settings.packages      = packages;
					settings.tags.platform = platforms;
					settings.target        = target;
					settings.variant       = 'library';
					settings.profile       = null;

				}


				environments[platform + '/' + id] = settings;
				this.platforms[platform] = true;

			}

		} else {

			if (environments[platform + '/' + id] instanceof Object) {

				delete environments[platform + '/' + id];
				this.platforms[platform] = false;

			}

		}

	};

	const _parse_package = function() {

		let environments = this.config.buffer.build.environments;
		let platforms    = Object.keys(this.platforms);
		let id           = /^\/libraries\//g.test(this.identifier) ? 'dist' : 'main';


		for (let p = 0, pl = platforms.length; p < pl; p++) {

			let platform = platforms[p];
			let settings = environments[platform + '/' + id];

			if (settings instanceof Object) {

				if (settings.packages instanceof Object) {

					for (let pid in settings.packages) {

						let url = settings.packages[pid];
						let pkg = this.__packages[pid] || null;
						if (pkg === null) {
							this.__packages[pid] = url;
						}

					}

				}


				this.platforms[platform] = true;
				this.__target            = settings.target || null;

			} else {

				this.platforms[platform] = false;

			}

		}

		if (this.__target === null) {
			this.__target = id === 'dist' ? 'app.DIST' : 'app.Main';
		}

		if (Object.keys(this.__packages).length === 0) {
			this.__packages['app'] = './lychee.pkg';
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);

		this.identifier  = typeof states.identifier === 'string' ? states.identifier : '/projects/boilerplate';
		this.config      = new Config(this.identifier + '/lychee.pkg');
		this.icon        = new Texture(this.identifier + '/icon.png');
		this.harvester   = true;
		this.platforms   = {
			'html':         true,
			'html-nwjs':    true,
			'html-webview': true,
			'nidium':       true,
			'node':         true,
			'node-sdl':     true
		};

		this.__harvester = new Stuff(this.identifier + '/harvester.js', true);
		this.__packages  = {};
		this.__target    = null;


		states = null;

	};

	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.config !== undefined) {
				this.config = lychee.deserialize(blob.config);
			}

			if (blob.icon !== undefined) {
				this.icon = lychee.deserialize(blob.icon);
			}

			if (blob.harvester !== undefined) {
				this.__harvester = lychee.deserialize(blob.harvester);
			}

			if (blob.settings instanceof Object) {

				if (blob.settings.harvester !== undefined) {
					this.harvester = blob.settings.harvester;
				}

				if (blob.settings.platforms instanceof Object) {

					for (let p in blob.settings.platforms) {
						this.platforms[p] = blob.settings.platforms[p];
					}

				}

			}

		},

		serialize: function() {

			let states = {};
			let blob   = {};


			if (this.identifier !== '/projects/boilerplate') states.identifier = this.identifier;


			if (this.harvester !== true) {

				if (blob.settings === undefined) {
					blob.settings = {};
				}

				blob.settings.harvester = this.harvester;

			}

			let platforms = Object.values(this.platforms);
			if (platforms.includes(false) === true) {
				blob.settings.platforms = lychee.serialize(this.platforms);
			}

			if (this.config.buffer !== null)      blob.config    = lychee.serialize(this.config);
			if (this.icon.buffer !== null)        blob.icon      = lychee.serialize(this.icon);
			if (this.__harvester.buffer !== null) blob.harvester = lychee.serialize(this.__harvester);


			return {
				'constructor': 'studio.data.Project',
				'arguments':   [ states ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		load: function() {

			this.config.onload = result => {

				if (this.config.buffer instanceof Object) {
					_parse_package.call(this);
				}

			};

			this.__harvester.onload = result => {

				let buffer = this.__harvester.buffer.toString('utf8');
				let line   = buffer.split('\n')[0];
				if (line.startsWith('#!')) {
					this.setHarvester(true);
				} else {
					this.setHarvester(false);
				}

			};


			this.__harvester.load();
			this.config.load();
			this.icon.load();


			if (this.onload instanceof Function) {
				setTimeout(_ => this.onload(this), 500);
			}


			return true;

		},

		getAssets: function() {

			let filtered = [];
			let files    = _package_files(this.config.buffer);

			for (let f = 0, fl = files.length; f < fl; f++) {

				let file = files[f];
				if (file.substr(-3) !== '.js') {
					filtered.push(file);
				}

			}

			return filtered;

		},

		getEntities: function() {

			let filtered = [];
			let files    = _package_files(this.config.buffer);

			for (let f = 0, fl = files.length; f < fl; f++) {

				let file = files[f];
				if (
					(file.startsWith('app/') || file.startsWith('ui/'))
					&& file.endsWith('.js')
				) {
					filtered.push(file);
				}

			}

			return filtered;

		},

		getScenes: function() {

			let filtered = [];
			let files    = _package_files(this.config.buffer);

			for (let f = 0, fl = files.length; f < fl; f++) {

				let file = files[f];
				if (file.startsWith('state/') && file.endsWith('.json')) {
					filtered.push(file);
				}

			}

			return filtered;

		},

		setHarvester: function(harvester) {

			harvester = typeof harvester === 'boolean' ? harvester : null;


			if (harvester !== null) {

				this.harvester = harvester;

				return true;

			}


			return false;

		},

		setIcon: function(icon) {

			icon = icon instanceof Texture ? icon : null;


			if (icon !== null) {

				this.icon     = icon;
				this.icon.url = this.identifier + '/icon.png';

				return true;

			}


			return false;

		},

		setIdentifier: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				this.identifier = identifier;
				this.config.url = identifier + '/lychee.pkg';
				this.icon.url   = identifier + '/icon.png';

				return true;

			}


			return false;

		},

		setPlatforms: function(platforms) {

			platforms = platforms instanceof Object ? platforms : null;


			if (platforms !== null) {

				for (let key in platforms) {

					if (this.platforms[key] !== platforms[key]) {
						_set_platform.call(this, key, platforms[key]);
					}

				}

				return true;

			}


			return false;

		}

	};


	return Composite;

});

