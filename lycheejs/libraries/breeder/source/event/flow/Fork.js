lychee.define('breeder.event.flow.Fork').requires([
	'lychee.Package',
	'lychee.Stash'
]).includes([
	'lychee.event.Flow'
]).exports((lychee, global, attachments) => {

	const _Flow    = lychee.import('lychee.event.Flow');
	const _Package = lychee.import('lychee.Package');
	const _Stash   = lychee.import('lychee.Stash');
	const _ASSET   = '/libraries/breeder/asset/fork';
	const _STASH   = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.assets  = [];
		this.sources = [];

		this.debug   = false;
		this.library = null;
		this.project = null;
		this.stash   = new _Stash({
			type: _Stash.TYPE.persistent
		});

		this.__environments = [];
		this.__library      = null;
		this.__namespace    = null;
		this.__packages     = {};


		this.setDebug(states.debug);
		this.setLibrary(states.library);
		this.setProject(states.project);


		_Flow.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read-package', function(oncomplete) {

			let library = this.library;
			let project = this.project;

			if (library !== null && project !== null) {

				console.log('breeder: FORK/READ-PACKAGE "' + library + '" -> "' + project + '"');


				if (library !== '/libraries/lychee' && project !== '/libraries/lychee') {

					console.log('breeder: -> Mapping /libraries/lychee/lychee.pkg as "lychee"');

					this.__packages['lychee'] = new _Package({
						url:  '/libraries/lychee/lychee.pkg',
						type: 'source'
					});

				}


				let pkg_library = new _Package({
					url:  library + '/lychee.pkg',
					type: 'source'
				});

				let pkg_project = new _Package({
					url:  project + '/lychee.pkg',
					type: 'source'
				});

				console.log('breeder: -> Mapping ' + pkg_library.url + ' as "' + pkg_library.id + '"');
				console.log('breeder: -> Mapping ' + pkg_project.url + ' as "' + pkg_project.id + '"');

				setTimeout(_ => {
					this.__namespace                = pkg_project.id;
					this.__library                  = pkg_library;
					this.__packages[pkg_library.id] = pkg_library;
					this.__packages[pkg_project.id] = pkg_project;
					oncomplete(true);
				}, 200);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('trace-environments', function(oncomplete) {

			let library = this.library;
			let project = this.project;

			if (library !== null) {

				console.log('breeder: FORK/TRACE-ENVIRONMENTS "' + library + '"');


				let pkg = this.__library || null;
				if (pkg !== null) {

					pkg.setType('build');

					let environments = pkg.getEnvironments();
					if (environments.length > 0) {

						if (project.startsWith('/libraries')) {

							this.__environments = environments.filter(env => env.id.endsWith('/dist') && env.variant === 'library');
							this.__environments.forEach(env => {

								if (typeof env.target === 'string') {
									env.target = 'fork.' + env.target.split('.').slice(1).join('.');
								}

								env.packages = {
									fork: './lychee.pkg',
									app:  library + '/lychee.pkg'
								};

							});

						} else if (project.startsWith('/projects')) {

							this.__environments = environments.filter(env => env.id.endsWith('/main') && env.variant === 'application');
							this.__environments.forEach(env => {

								let profile = env.profile;
								if (profile instanceof Object) {

									if (typeof profile.client === 'string') {
										profile.client = profile.client.replace(library, project);
									}

									if (typeof profile.server === 'string') {
										profile.server = profile.server.replace(library, project);
									}

								}

								if (typeof env.target === 'string') {
									env.target = 'fork.' + env.target.split('.').slice(1).join('.');
								}

								env.packages = {
									fork: './lychee.pkg',
									app:  library + '/lychee.pkg'
								};

							});

						}

					}

					pkg.setType('source');

					oncomplete(true);

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-assets', function(oncomplete) {

			let project = this.project;
			if (project !== null) {

				console.log('breeder: FORK/READ-ASSETS "' + _ASSET + '"');


				let urls = [
					_ASSET + '/index.html',
					_ASSET + '/lychee.pkg'
				];


				let node_main = this.__environments.find(env => env.id === 'node/main') || null;
				if (node_main !== null) {
					urls.push(_ASSET + '/harvester.js');
				}


				_STASH.read(urls, function(assets) {

					this.assets = assets.filter(asset => asset !== null);

					this.assets.forEach(asset => {
						asset.url = project + asset.url.substr(_ASSET.length);
					});

					oncomplete(true);

				}, this);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-sources', function(oncomplete) {

			let project = this.project;
			if (project !== null) {

				console.log('breeder: FORK/READ-SOURCES "' + _ASSET + '"');


				let urls = [
					_ASSET + '/source/Main.js'
				];

				if (project.startsWith('/libraries')) {
					urls.push(_ASSET + '/source/DIST.js');
				}


				_STASH.read(urls, function(assets) {

					this.sources = assets.filter(asset => asset !== null);

					this.sources.forEach(asset => {
						asset.url = project + asset.url.substr(_ASSET.length);
					});

					oncomplete(true);

				}, this);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-assets', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: INIT/WRITE-ASSETS "' + project + '"');


				let assets = this.assets.filter(asset => asset !== null);

				// XXX: write-package is a separate event
				assets = assets.filter(asset => !asset.url.endsWith('/lychee.pkg'));

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

		this.bind('write-sources', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: INIT/WRITE-SOURCES "' + project + '"');


				let sources = this.sources.filter(asset => asset !== null);
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

		this.bind('write-package', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: INIT/WRITE-PACKAGE "' + project + '"');


				let pkg = this.assets.find(asset => asset.url.endsWith('/lychee.pkg')) || null;
				if (pkg !== null) {

					let environments = this.__environments;
					if (environments.length > 0) {

						environments.forEach(env => {
							pkg.buffer.build.environments[env.id] = env;
							delete env.id;
						});

					}

					stash.write([ pkg.url ], [ pkg ], result => oncomplete(result), this);
					stash.sync();

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

		this.then('trace-environments');

		this.then('read-assets');
		this.then('read-sources');

		this.then('write-assets');
		this.then('write-sources');
		this.then('write-package');

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.sources instanceof Array) {
				this.sources = blob.sources.map(lychee.deserialize).filter(source => source !== null);
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
			data['constructor'] = 'breeder.event.flow.Fork';


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.debug !== false)  states.debug   = this.debug;
			if (this.library !== null) states.library = this.library;
			if (this.project !== null) states.project = this.project;


			if (this.stash !== null)     blob.stash   = lychee.serialize(this.stash);
			if (this.assets.length > 0)  blob.assets  = this.assets.map(lychee.serialize);
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

		setLibrary: function(library) {

			library = typeof library === 'string' ? library : null;


			if (library !== null) {

				this.library = library;

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
