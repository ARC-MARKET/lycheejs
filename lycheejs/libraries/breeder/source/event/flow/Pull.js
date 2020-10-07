
lychee.define('breeder.event.flow.Pull').requires([
	'lychee.Package',
	'lychee.Stash'
]).includes([
	'lychee.event.Flow'
]).exports((lychee, global, attachments) => {

	const _Flow    = lychee.import('lychee.event.Flow');
	const _Package = lychee.import('lychee.Package');
	const _Stash   = lychee.import('lychee.Stash');
	const _STASH   = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * HELPERS
	 */

	const _inject_html = function(asset, injections) {

		if (injections.length > 0) {

			let code    = asset.buffer.toString('utf8').split('\n');
			let scripts = [];


			code.forEach((line, l) => {

				let chunk = line.trim();
				if (chunk.startsWith('<script src="/libraries') && chunk.endsWith('</script>')) {
					scripts.push({
						chunk: chunk,
						index: l
					});
				}

			});


			let filtered = injections.filter(inject => {

				let check = scripts.find(s => s.chunk.includes(inject.url)) || null;
				if (check === null) {
					return true;
				}

				return false;

			});

			if (filtered.length > 0) {

				let script = scripts.filter(s => s.chunk.includes('/libraries/crux')).pop() || null;
				if (script !== null) {

					filtered.forEach((inject, i) => {
						let chunk = '\t<script src="' + inject.url + '"></script>';
						code.splice(script.index + i + 1, 0, chunk);
					});

					asset.buffer = Buffer.from(code.join('\n'), 'utf8');

				}

			}

		}

	};

	const _inject_node = function(asset, injections) {

		if (injections.length > 0) {

			let code    = asset.buffer.toString('utf8').split('\n');
			let scripts = [];


			code.forEach((line, l) => {

				let chunk = line.trim();
				if (chunk.startsWith('require(_ROOT')) {
					scripts.push({
						chunk: chunk,
						index: l
					});
				}

			});


			let filtered = injections.filter(inject => {

				let check = scripts.find(s => s.chunk.includes(inject.url)) || null;
				if (check === null) {
					return true;
				}

				return false;

			});

			if (filtered.length > 0) {

				let script = scripts.filter(s => s.chunk.includes('/libraries/crux')).pop() || null;
				if (script !== null) {

					filtered.forEach((inject, i) => {
						let chunk = 'require(_ROOT + \'' + inject.url + '\');';
						code.splice(script.index + i + 1, 0, chunk);
					});

					asset.buffer = Buffer.from(code.join('\n'), 'utf8');

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.assets  = [];
		this.injects = [];
		this.sources = [];

		this.debug   = false;
		this.library = null;
		this.project = null;
		this.stash   = new _Stash({
			type: _Stash.TYPE.persistent
		});

		this.__namespace = null;
		this.__packages  = {};


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

				console.log('breeder: PULL/READ-PACKAGE "' + library + '" -> "' + project + '"');


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
					this.__packages[pkg_library.id] = pkg_library;
					this.__packages[pkg_project.id] = pkg_project;
					oncomplete(true);
				}, 200);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-assets', function(oncomplete) {

			let project = this.project;
			let stash   = this.stash;

			if (project !== null && stash !== null) {

				console.log('breeder: PULL/READ-ASSETS "' + project + '"');

				stash.read([
					project + '/harvester.js',
					project + '/index.html'
				], function(assets) {

					this.assets = assets.filter(asset => asset !== null && asset.buffer !== null);
					oncomplete(true);

				}, this);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-injects', function(oncomplete) {

			let library = this.library;
			let project = this.project;

			if (library !== null && project !== null) {

				console.log('breeder: PULL/READ-INJECTS "' + project + '"');


				let pkg = this.__packages[this.__namespace] || null;
				if (pkg !== null) {

					pkg.setType('build');

					let platforms = [];

					pkg.getEnvironments().forEach(env => {

						let platform_tag = (env.tags || {}).platform || [];
						if (platform_tag.length > 0) {

							platform_tag.forEach(value => {

								if (platforms.includes(value) === false) {
									platforms.push(value);
								}

							});

						}

					});

					pkg.setType('source');


					if (platforms.length > 0) {

						platforms = platforms.sort();

						_STASH.read(platforms.map(platform => library + '/build/' + platform + '/dist/index.js'), function(assets) {
							this.injects = assets.filter(asset => asset !== null && asset.buffer !== null);
							oncomplete(true);
						}, this);

					} else {
						oncomplete(true);
					}

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-assets', function(oncomplete) {

			let debug   = this.debug;
			let injects = this.injects;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: PULL/WRITE-ASSETS "' + project + '"');


				let index = this.assets.find(asset => asset.url.endsWith('/index.html')) || null;
				if (index !== null) {
					_inject_html(index, injects.filter(inject => inject.url.includes('/html/')));
				}

				let harvester = this.assets.find(asset => asset.url.endsWith('/harvester.js')) || null;
				if (harvester !== null) {
					_inject_node(harvester, injects.filter(inject => inject.url.includes('/node/')));
				}


				let assets = this.assets;
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

		this.bind('write-injects', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('breeder: PULL/WRITE-INJECTS "' + project + '"');


				let injects = this.injects;
				if (injects.length > 0) {
					stash.write(injects.map(asset => project + asset.url), injects, result => oncomplete(result), this);
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
		this.then('read-injects');

		this.then('write-assets');
		this.then('write-injects');

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.injects instanceof Array) {
				this.injects = blob.injects.map(lychee.deserialize).filter(source => source !== null);
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
			data['constructor'] = 'breeder.event.flow.Pull';


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.debug !== false)  states.debug   = this.debug;
			if (this.library !== null) states.library = this.library;
			if (this.project !== null) states.project = this.project;


			if (this.stash !== null)     blob.stash   = lychee.serialize(this.stash);
			if (this.assets.length > 0)  blob.assets  = this.assets.map(lychee.serialize);
			if (this.injects.length > 0) blob.injects = this.injects.map(lychee.serialize);


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

