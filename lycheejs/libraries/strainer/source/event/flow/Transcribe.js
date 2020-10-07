
lychee.define('strainer.event.flow.Transcribe').requires([
	'lychee.Package',
	'lychee.Stash',
	'strainer.api.PARSER',
	'strainer.plugin.API'
]).includes([
	'lychee.event.Flow'
]).exports((lychee, global, attachments) => {

	const _plugin  = {
		API: lychee.import('strainer.plugin.API')
	};
	const _Flow    = lychee.import('lychee.event.Flow');
	const _Package = lychee.import('lychee.Package');
	const _Stash   = lychee.import('lychee.Stash');
	const _PARSER  = lychee.import('strainer.api.PARSER');
	const _STASH   = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * IMPLEMENTATIONS
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.configs = [];
		this.errors  = [];
		this.sources = [];
		this.reviews = [];

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


		_Flow.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read-package', function(oncomplete) {

			let library = this.library;
			let project = this.project;
			let stash   = this.stash;

			if (library !== null && project !== null && stash !== null) {

				console.log('strainer: TRANSCRIBE/READ-PACKAGE "' + library + '"');


				if (project !== '/libraries/lychee') {

					console.log('strainer: -> Mapping /libraries/lychee/lychee.pkg as "lychee"');

					this.__packages['lychee'] = new _Package({
						id:  'lychee',
						url: '/libraries/lychee/lychee.pkg'
					});

				}


				let pkg = new _Package({
					url:  library + '/lychee.pkg',
					type: 'source'
				});

				console.log('strainer: -> Mapping ' + pkg.url + ' as "' + pkg.id + '"');

				setTimeout(_ => {
					this.__namespace        = pkg.id;
					this.__packages[pkg.id] = pkg;
					oncomplete(true);
				}, 200);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-configs', function(oncomplete) {

			let library   = this.library;
			let namespace = this.__namespace;
			let project   = this.project;
			let stash     = this.stash;

			if (library !== null && namespace !== null && project !== null && stash !== null) {

				console.log('strainer: TRANSCRIBE/READ-CONFIGS "' + library + '"');


				let pkg = this.__packages[namespace] || null;
				if (pkg !== null) {

					pkg.setType('api');

					let configs = pkg.getFiles().filter(url => url.endsWith('.json'));
					if (configs.length > 0) {

						stash.read(configs.map(url => library + '/api/' + url), assets => {
							this.configs = assets.filter(asset => asset !== null);
							oncomplete(true);
						}, this);

					} else {
						oncomplete(true);
					}

					pkg.setType('source');

				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('transcribe-sources', function(oncomplete) {

			let api     = _plugin.API;
			let debug   = this.debug;
			let library = this.library;
			let project = this.project;

			if (library !== null && project !== null) {

				console.log('strainer: TRANSCRIBE/TRANSCRIBE-SOURCES "' + library + '" -> "' + project + '"');


				let configs = this.configs.filter(config => config.buffer !== null && config.buffer.source instanceof Object);
				if (configs.length > 0) {

					this.sources = configs.map(asset => {

						if (asset.url.includes('/api/')) {

							let config = new lychee.Asset(asset.url, 'json', true);
							if (config !== null) {

								config.buffer = {
									header: asset.buffer.source.header,
									memory: asset.buffer.source.memory,
									result: asset.buffer.source.result
								};

							}

							let url = asset.url.replace('/api/', '/source/').replace(/\.json$/, '.js');
							if (url.startsWith(library) === true) {
								url = project + url.substr(library.length);
							}

							let buffer = api.transcribe(config);
							if (buffer !== null) {

								let source = new Stuff(url, true);

								source.buffer = buffer;

								return source;

							}

						}


						return null;

					});

				} else {

					if (debug === true) {
						console.warn('strainer: -> No configs for sources available. (SKIP)');
					}

				}


				oncomplete(true);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('transcribe-reviews', function(oncomplete) {

			let api     = _plugin.API;
			let debug   = this.debug;
			let library = this.library;
			let project = this.project;

			if (library !== null && project !== null) {

				console.log('strainer: TRANSCRIBE/TRANSCRIBE-REVIEWS "' + library + '" -> "' + project + '"');


				let configs = this.configs.filter(config => config.buffer !== null && config.buffer.review instanceof Object);
				if (configs.length > 0) {

					this.reviews = configs.map(asset => {

						if (asset.url.includes('/api/')) {

							let config = new lychee.Asset(asset.url, 'json', true);
							if (config !== null) {

								config.buffer = {
									header: asset.buffer.review.header,
									memory: asset.buffer.review.memory,
									result: asset.buffer.review.result
								};

							}

							let url = asset.url.replace('/api/', '/review/').replace(/\.json$/, '.js');
							if (url.startsWith(library) === true) {
								url = project + url.substr(library.length);
							}

							let buffer = api.transcribe(config);
							if (buffer !== null) {

								let review = new Stuff(url, true);

								review.buffer = buffer;

								return review;

							}

						}


						return null;

					});

				} else {

					if (debug === true) {
						console.warn('strainer: -> No configs for reviews available. (SKIP)');
					}

				}


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

				console.log('strainer: TRANSCRIBE/WRITE-SOURCES "' + project + '"');


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

		this.bind('write-reviews', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('strainer: TRANSCRIBE/WRITE-REVIEWS "' + project + '"');


				let reviews = this.reviews.filter(asset => asset !== null);
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

		this.then('read-configs');

		this.then('transcribe-sources');
		this.then('transcribe-reviews');

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

			if (blob.configs instanceof Array) {
				this.configs = blob.configs.map(lychee.deserialize).filter(config => config !== null);
			}


			let stash = lychee.deserialize(blob.stash);
			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'strainer.event.flow.Transcribe';


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.debug !== false)  states.debug   = this.debug;
			if (this.library !== null) states.library = this.library;
			if (this.project !== null) states.project = this.project;


			if (this.stash !== null)     blob.stash   = lychee.serialize(this.stash);
			if (this.configs.length > 0) blob.configs = this.configs.map(lychee.serialize);
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

