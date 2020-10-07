
lychee.define('breeder.event.flow.Init').requires([
	'lychee.Package',
	'lychee.Stash',
	'strainer.Main'
]).includes([
	'lychee.event.Flow'
]).exports((lychee, global, attachments) => {

	const _Flow    = lychee.import('lychee.event.Flow');
	const _Main    = lychee.import('strainer.Main');
	const _Package = lychee.import('lychee.Package');
	const _Stash   = lychee.import('lychee.Stash');
	const _ASSET   = '/libraries/breeder/asset/init';
	const _STASH   = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * HELPERS
	 */

	const _create_config = function(identifier, includes) {

		let config = null;

		let pkg = this.__packages[identifier.split('.')[0]] || null;
		if (pkg !== null) {

			let url_prefix = pkg.url.split('/').slice(0, -1).join('/');
			let url_suffix = identifier.split('.').slice(1).join('/');

			config = new Config(url_prefix + '/api/' + url_suffix + '.json');

			config.buffer = {
				source: {
					header: {
						identifier: identifier,
						includes:   includes,
						type:       'Composite'
					},
					memory: {},
					result: {}
				}
			};

			includes.forEach(include => {

				let name = '_' + include.split('.').pop();

				config.buffer.source.memory[name] = {
					type:  'lychee.Definition',
					value: {
						reference: include,
						arguments: []
					}
				};

			});

		}

		return config;

	};

	const _STATIC_INCLUDES = {
		'app.Main':     [ 'lychee.app.Main' ],
		'app.Input':    [ 'lychee.Input'    ],
		'app.Renderer': [ 'lychee.Renderer' ],
		'app.Stash':    [ 'lychee.Stash'    ],
		'app.Storage':  [ 'lychee.Storage'  ],
		'app.Viewport': [ 'lychee.Viewport' ]
	};

	const _format_id = function(id) {

		let tmp = id.split('.');

		let check = tmp[tmp.length - 1];
		if (check.charAt(0) !== check.charAt(0).toUpperCase()) {
			tmp[tmp.length - 1] = check.charAt(0).toUpperCase() + check.substr(1).toLowerCase();
		}

		return tmp.join('.');

	};

	const _get_includes = function(identifier) {

		let includes = [];
		let tmp      = identifier.split('.').slice(0, -1);

		let pkg_id = identifier.split('.')[0];
		if (pkg_id === 'app') {
			includes.push(_format_id('lychee.' + tmp.join('.')));
		}

		if (tmp.length > 2) {
			includes.push(_format_id('lychee.' + tmp.slice(1).join('.')));
		}


		let pkg = this.__packages['lychee'] || null;
		if (pkg !== null) {

			let definitions = pkg.getDefinitions().map(id => 'lychee.' + id);
			if (definitions.length > 0) {
				includes = includes.filter(id => definitions.includes(id));
			}

		}


		if (includes.length === 0) {

			let pkg = this.__packages[pkg_id] || null;
			if (pkg !== null) {

				let tmp = identifier.split('.');
				if (tmp.length > 2) {
					includes.push(_format_id(tmp.slice(0, -1).join('.')));
				}

				if (tmp.length > 3) {
					includes.push(_format_id(tmp.slice(0, -2).join('.')));
				}

				let definitions = pkg.getDefinitions().map(id => pkg_id + '.' + id);
				if (definitions.length > 0) {
					includes = includes.filter(id => definitions.includes(id));
				}

			}

			let static_includes = _STATIC_INCLUDES[identifier] || [];
			if (static_includes.length > 0) {
				includes.push.apply(includes, static_includes);
			}

		}


		return includes;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.assets  = [];
		this.configs = [];
		this.reviews = [];
		this.sources = [];

		this.debug      = false;
		this.project    = null;
		this.identifier = null;
		this.stash      = new _Stash({
			type: _Stash.TYPE.persistent
		});

		this.__namespace = null;
		this.__packages  = {};


		this.setDebug(states.debug);
		this.setProject(states.project);
		this.setIdentifier(states.identifier);


		_Flow.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read-package', function(oncomplete) {

			let identifier = this.identifier;
			let project    = this.project;

			if (identifier !== null && project !== null) {

				console.log('breeder: INIT/READ-PACKAGE "' + project + '"');


				if (project !== '/libraries/lychee') {

					console.log('breeder: -> Mapping /libraries/lychee/lychee.pkg as "lychee"');

					this.__packages['lychee'] = new _Package({
						url:  '/libraries/lychee/lychee.pkg',
						type: 'source'
					});

				}


				let pkg = new _Package({
					url:  project + '/lychee.pkg',
					type: 'source'
				});

				console.log('breeder: -> Mapping ' + pkg.url + ' as "' + pkg.id + '"');

				setTimeout(_ => {
					this.__namespace        = pkg.id;
					this.__packages[pkg.id] = pkg;
					oncomplete(true);
				}, 200);

			} else if (identifier === null) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-assets', function(oncomplete) {

			let identifier = this.identifier;
			let project    = this.project;

			if (identifier === null && project !== null) {

				console.log('breeder: INIT/READ-ASSETS "' + _ASSET + '"');


				_STASH.read([
					_ASSET + '/harvester.js',
					_ASSET + '/icon.png',
					_ASSET + '/icon.svg',
					_ASSET + '/index.html',
					_ASSET + '/lychee.pkg'
				], function(assets) {

					this.assets = assets.filter(asset => asset !== null);

					this.assets.forEach(asset => {
						asset.url = project + asset.url.substr(_ASSET.length);
					});

					let lychee_pkg = assets.find(asset => asset.url.endsWith('/lychee.pkg')) || null;
					if (lychee_pkg !== null) {

						lychee_pkg.buffer = JSON.parse(JSON.stringify(lychee_pkg.buffer, null, '\t').replaceObject({
							id: project
						}));

					}

					oncomplete(true);

				}, this);

			} else {
				oncomplete(true);
			}

		}, this);

		this.bind('read-sources', function(oncomplete) {

			let identifier = this.identifier;
			let project    = this.project;
			let stash      = this.stash;

			if (identifier === null && project !== null) {

				console.log('breeder: INIT/READ-SOURCES "' + _ASSET + '"');


				_STASH.read([
					_ASSET + '/source/Main.js',
					_ASSET + '/source/net/Client.js',
					_ASSET + '/source/net/Server.js',
					_ASSET + '/source/net/service/Ping.js',
					_ASSET + '/source/state/Welcome.js',
					_ASSET + '/source/state/Welcome.json'
				], function(assets) {

					this.sources = assets.filter(asset => asset !== null);

					this.sources.forEach(source => {
						source.url = project + source.url.substr(_ASSET.length);
					});

					oncomplete(true);

				}, this);

			} else if (identifier !== null && project !== null && stash !== null) {

				console.log('breeder: INIT/READ-SOURCES "' + project + '"');


				let pkg = this.__packages[identifier.split('.')[0]] || null;
				if (pkg !== null) {

					pkg.setType('source');

					let id   = identifier.split('.').slice(1).join('.');
					let file = pkg.resolve(id)[0] || null;
					if (file !== null) {

						console.log('breeder: -> Loading "' + identifier + '"');

						let source = new Stuff(project + '/source/' + file + '.js', true);

						source.onload = function(result) {

							if (result === true) {
								this.sources = [ source ];
								oncomplete(true);
							} else {
								oncomplete(true);
							}

						}.bind(this);

						source.load();

					} else {
						oncomplete(true);
					}

					pkg.setType('source');

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-reviews', function(oncomplete) {

			let identifier = this.identifier;
			let project    = this.project;
			let stash      = this.stash;

			if (identifier !== null && project !== null && stash !== null) {

				console.log('breeder: INIT/READ-REVIEWS "' + project + '"');


				let pkg = this.__packages[identifier.split('.')[0]] || null;
				if (pkg !== null) {

					pkg.setType('review');

					let id   = identifier.split('.').slice(1).join('.');
					let file = pkg.resolve(id)[0] || null;
					if (file !== null) {

						console.log('breeder: -> Loading "' + identifier + '"');

						let review = new Stuff(project + '/review/' + file + '.js', true);

						review.onload = function(result) {

							if (result === true) {
								this.reviews = [ review ];
								oncomplete(true);
							} else {
								oncomplete(true);
							}

						}.bind(this);

						review.load();

					} else {
						oncomplete(true);
					}

					pkg.setType('source');

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(true);
			}

		}, this);

		this.bind('transcribe-sources', function(oncomplete) {

			let debug      = this.debug;
			let identifier = this.identifier;
			let project    = this.project;

			if (identifier !== null && project !== null) {

				console.log('breeder: INIT/TRANSCRIBE-SOURCES "' + project + '"');


				let sources = this.sources;
				if (sources.length === 0) {

					let includes = _get_includes.call(this, identifier);
					if (includes.length > 0) {

						console.log('breeder: -> "' + identifier + '" includes ["' + includes.join('","') + '"].');

						let mockup   = _create_config.call(this, identifier, includes);
						let strainer = new _Main({
							debug:   debug,
							library: project,
							project: project
						});

						strainer.transcribe(mockup, source => {

							if (source !== null) {

								strainer.check(source, config => {

									if (config !== null) {

										this.configs.push(config);
										this.sources.push(source);

										oncomplete(true);

									} else {
										oncomplete(false);
									}

								});

							} else {

								if (debug === true) {
									console.error('breeder: -> Invalid generated source code.');
									console.error(mockup);
								}

								oncomplete(false);

							}

						});

					} else {

						if (debug === true) {
							console.error('breeder: -> Invalid identifier "' + identifier + '".');
							console.error('breeder: -> Invalid generated includes.');
						}

						oncomplete(false);

					}

				} else {
					oncomplete(true);
				}

			} else {
				oncomplete(true);
			}

		}, this);

		this.bind('transcribe-reviews', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {
				// TODO: Transcribe Review from Source
			}

			oncomplete(true);

		}, this);

		this.bind('write-assets', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: INIT/WRITE-ASSETS "' + project + '"');


				let assets = this.assets.filter(asset => asset !== null);
				if (assets.length > 0) {
					stash.write(assets.map(asset => asset.url), assets, result => oncomplete(result), this);
				} else {
					oncomplete(true);
				}

			} else if (debug === true) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-configs', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: INIT/WRITE-CONFIGS "' + project + '"');


				let configs = this.configs.filter(config => config !== null);
				if (configs.length > 0) {
					stash.write(configs.map(asset => asset.url), configs, result => oncomplete(result), this);
				} else {
					oncomplete(true);
				}

			} else if (debug === true) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-sources', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: INIT/WRITE-SOURCES "' + project + '"');


				let sources = this.sources.filter(source => source !== null);
				if (sources.length > 0) {
					stash.write(sources.map(asset => asset.url), sources, result => oncomplete(result), this);
				} else {
					oncomplete(true);
				}

			} else if (debug === true) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-reviews', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: INIT/WRITE-REVIEWS "' + project + '"');


				let reviews = this.reviews.filter(review => review !== null);
				if (reviews.length > 0) {
					stash.write(reviews.map(asset => asset.url), reviews, result => oncomplete(result), this);
				} else {
					oncomplete(true);
				}

			} else if (debug === true) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);



		/*
		 * FLOW
		 */

		this.then('read-package');

		this.then('read-assets');
		this.then('read-sources');
		this.then('read-reviews');

		this.then('transcribe-sources');
		this.then('transcribe-reviews');

		this.then('write-assets');
		this.then('write-configs');
		this.then('write-sources');
		this.then('write-reviews');

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.sources instanceof Array) {
				this.sources = blob.sources.map(lychee.deserialize).filter(source => source !== null);
			}

			if (blob.reviews instanceof Array) {
				this.reviews = blob.reviews.map(lychee.deserialize).filter(review => review !== null);
			}

			if (blob.assets instanceof Array) {
				this.assets = blob.assets.map(lychee.deserialize).filter(asset => asset !== null);
			}


			let stash = lychee.deserialize(blob.stash);
			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'breeder.event.flow.Init';


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.debug !== false)     states.debug      = this.debug;
			if (this.identifier !== null) states.identifier = this.identifier;
			if (this.project !== null)    states.project    = this.project;


			if (this.stash !== null)     blob.stash   = lychee.serialize(this.stash);
			if (this.assets.length > 0)  blob.assets  = this.assets.map(lychee.serialize);
			if (this.reviews.length > 0) blob.reviews = this.reviews.map(lychee.serialize);
			if (this.sources.length > 0) blob.sources = this.sources.map(lychee.serialize);


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setDebug: function(debug) {

			debug = typeof debug === 'boolean' ? debug : null;


			if (debug !== null) {

				this.debug = debug;

				return true;

			}


			return false;

		},

		setIdentifier: function(identifier) {

			identifier = typeof identifier === 'string' ? identifier : null;


			if (identifier !== null) {

				this.identifier = identifier;

				return true;

			}


			return false;

		},

		setProject: function(project) {

			project = typeof project === 'string' ? project : null;


			if (project !== null) {

				this.project = project;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

