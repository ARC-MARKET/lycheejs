
lychee.define('strainer.Main').requires([
	'strainer.event.flow.Check',
	'strainer.event.flow.Simulate',
	'strainer.event.flow.Transcribe'
]).includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _lychee     = lychee.import('lychee');
	const _Emitter    = lychee.import('lychee.event.Emitter');
	const _Check      = lychee.import('strainer.event.flow.Check');
	const _Simulate   = lychee.import('strainer.event.flow.Simulate');
	const _Transcribe = lychee.import('strainer.event.flow.Transcribe');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.settings = _lychee.assignsafe({
			action:  null,
			cwd:     lychee.ROOT.lychee,
			debug:   false,
			library: null,
			project: null
		}, states);


		let debug = this.settings.debug;
		if (debug === true) {
			console.log('strainer.Main: Parsed settings are ...');
			console.log(this.settings);
		}


		_Emitter.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			let project = this.settings.project || null;
			if (project !== null) {

				let cwd = this.settings.cwd || null;
				if (cwd === _lychee.ROOT.lychee) {

					// XXX: lycheejs-strainer check /projects/my-project

					lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
					lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;

				} else if (cwd.startsWith(_lychee.ROOT.lychee)) {

					// XXX: cd /opt/lycheejs/projects && lycheejs-strainer check my-project

					if (project.startsWith(_lychee.ROOT.lychee)) {
						project = project.substr(_lychee.ROOT.lychee.length);
					}

					lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
					lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;

				} else {

					// XXX: lycheejs-strainer check /home/whatever/my-project

					lychee.ROOT.lychee                            = '';
					lychee.ROOT.project                           = project;
					lychee.environment.global.lychee.ROOT.project = project;

					// XXX: Disable sandbox for external projects
					lychee.environment.resolve = function(url) {

						if (url.startsWith('/libraries') || url.startsWith('/projects')) {
							return '/opt/lycheejs' + url;
						} else {
							return url;
						}

					};

				}


				this.trigger('init');

			} else {

				console.error('strainer: FAILURE ("' + project + '") at "load" event.');

				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function() {

			let action  = this.settings.action  || null;
			let debug   = this.settings.debug   || false;
			let library = this.settings.library || null;
			let project = this.settings.project || null;

			if (action !== null && project !== null) {

				let flow = null;

				if (action === 'check') {

					flow = new _Check({
						debug:   debug,
						project: project
					});

				} else if (action === 'simulate') {

					flow = new _Simulate({
						debug:   debug,
						project: project
					});

				} else if (action === 'transcribe') {

					flow = new _Transcribe({
						debug:   debug,
						library: library,
						project: project
					});

				}


				if (flow !== null) {

					flow.bind('complete', function() {

						if (flow.errors.length === 0) {

							console.info('strainer: SUCCESS ("' + project + '")');

							this.destroy(0);

						} else {

							flow.errors.forEach(err => {

								let path = err.url;
								let rule = err.rule    || 'parser-error';
								let line = err.line    || 0;
								let col  = err.column  || 0;
								let msg  = err.message || 'Parsing error: unknown';
								if (msg.endsWith('.') === false) {
									msg = msg.trim() + '.';
								}


								let message = '';

								message += path;
								message += ':' + line;
								message += ':' + col;
								message += ': ' + msg;
								message += ' [' + rule + ']';

								if (err.rule.startsWith('unguessable-')) {
									console.warn('strainer: ' + message);
								} else {
									console.error('strainer: ' + message);
								}

							});

							console.error('strainer: FAILURE ("' + project + '")');

							this.destroy(1);

						}

					}, this);

					flow.bind('error', function(event) {

						console.error('strainer: FAILURE ("' + project + '") at "' + event + '" event.');

						this.destroy(1);

					}, this);


					flow.init();

				}

			}

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'strainer.Main';


			let states = _lychee.assignunlink({}, this.settings);
			let blob   = data['blob'] || {};


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			let action  = this.settings.action  || null;
			let project = this.settings.project || null;

			if (action !== null && project !== null) {

				this.trigger('load');

				return true;

			}


			return false;

		},

		destroy: function(code) {

			code = typeof code === 'number' ? code : 0;


			this.trigger('destroy', [ code ]);

			return true;

		},

		check: function(asset, callback) {

			asset    = asset instanceof Stuff       ? asset    : null;
			callback = callback instanceof Function ? callback : null;


			if (asset !== null && callback !== null) {

				let project = this.settings.project;
				if (project !== null) {

					let flow = new _Check({
						debug:   this.settings.debug || false,
						project: project
					});

					flow.unbind('read-sources');
					flow.unbind('read-reviews');
					flow.unbind('write-sources');
					flow.unbind('write-reviews');
					flow.unbind('write-configs');
					flow.unbind('write-package');

					flow.bind('read-sources', function(oncomplete) {
						this.sources = [ asset ];
						oncomplete(true);
					});

					flow.bind('read-reviews',  oncomplete => oncomplete(true));
					flow.bind('write-sources', oncomplete => oncomplete(true));
					flow.bind('write-reviews', oncomplete => oncomplete(true));
					flow.bind('write-configs', oncomplete => oncomplete(true));
					flow.bind('write-package', oncomplete => oncomplete(true));

					flow.bind('complete', function() {

						let configs = this.configs;
						if (configs.length > 0) {
							callback(configs[0]);
						} else {
							callback(null);
						}

					});

					flow.init();


					return true;

				}

			}


			return false;

		},

		transcribe: function(asset, callback) {

			asset    = asset instanceof Config      ? asset    : null;
			callback = callback instanceof Function ? callback : null;


			if (asset !== null && callback !== null) {

				let library = this.settings.library;
				let project = this.settings.project;

				if (library !== null && project !== null) {

					let flow = new _Transcribe({
						debug:   this.settings.debug || false,
						library: library,
						project: project
					});

					flow.unbind('read-configs');
					flow.unbind('write-sources');

					flow.bind('read-configs', function(oncomplete) {
						this.configs = [ asset ];
						oncomplete(true);
					});

					flow.bind('write-sources', oncomplete => oncomplete(true));

					flow.bind('complete', function() {

						let sources = this.sources;
						if (sources.length > 0) {
							callback(sources[0]);
						} else {
							callback(null);
						}

					});

					flow.init();


					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

