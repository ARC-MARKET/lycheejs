
lychee.define('strainer.Fixer').requires([
	'strainer.event.flow.Check'
]).includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _lychee  = lychee.import('lychee');
	const _Emitter = lychee.import('lychee.event.Emitter');
	const _Check   = lychee.import('strainer.event.flow.Check');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.settings = _lychee.assignsafe({
			cwd:     lychee.ROOT.lychee,
			file:    null,
			project: null
		}, states);


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

					// XXX: lycheejs-strainer-fixer check /projects/my-project/source/Main.js

					lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
					lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;

				} else if (cwd.startsWith(_lychee.ROOT.lychee)) {

					// XXX: cd /opt/lycheejs/projects && lycheejs-strainer-fixer check my-project/source/Main.js

					if (project.startsWith(_lychee.ROOT.lychee)) {
						project = project.substr(_lychee.ROOT.lychee.length);
					}

					lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
					lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;

				} else {

					// XXX: lycheejs-strainer-fixer check /home/whatever/my-project/source/Main.js

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

				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function() {

			let debug   = this.settings.debug   || false;
			let file    = this.settings.file    || null;
			let project = this.settings.project || null;

			if (file !== null && project !== null) {

				let flow = new _Check({
					debug:   debug,
					project: project
				});

				flow.unbind('read-sources');
				flow.unbind('read-reviews');

				flow.bind('read-sources', function(oncomplete) {

					let namespace = this.__namespace;
					let project   = this.project;
					let stash     = this.stash;

					if (namespace !== null && project !== null && stash !== null) {

						console.log('strainer: CHECK/READ-SOURCES "' + project + '"');

						let pkg = this.__packages[namespace] || null;
						if (pkg !== null) {

							let source = new Stuff(project + '/' + file, true);

							source.onload = function(result) {

								if (result === true) {
									this.sources = [ source ];
									oncomplete(true);
								} else {
									oncomplete(false);
								}

							}.bind(this);

							source.load();

						} else {
							oncomplete(false);
						}

					} else {
						oncomplete(false);
					}

				}, flow);

				flow.bind('complete', function() {

					let cwd    = this.settings.cwd;
					let errors = flow.errors;

					if (errors.length > 0) {

						errors.forEach(err => {

							let path = err.url;
							if (
								path.startsWith('/opt/lycheejs') === false
								&& path.startsWith(cwd) === false
							) {
								path = cwd + '/' + err.url;
							}

							let rule = err.rule    || 'parser-error';
							let line = err.line    || 0;
							let col  = err.column  || 0;
							let msg  = err.message || 'Parsing error: unknown';
							if (msg.endsWith('.') === false) {
								msg = msg.trim() + '.';
							}


							let message = '';

							message += path.substr(cwd.length + 1);
							message += ':' + line;
							message += ':' + col;
							message += ': ' + msg;
							message += ' [' + rule + ']';

							console.error(message);

						});

						console.error('\n' + errors.length + ' ' + (errors.length === 1 ? 'problem' : 'problems'));

						this.destroy(1);

					} else {

						console.error('\n0 problems');

						this.destroy(0);

					}

				}, this);

				flow.bind('read-reviews', oncomplete => oncomplete(true), flow);

				flow.bind('error', _ => this.destroy(1), this);
				flow.init();

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
			data['constructor'] = 'strainer.Fixer';


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

			let file    = this.settings.file    || null;
			let project = this.settings.project || null;

			if (file !== null && project !== null) {

				this.trigger('load');

				return true;

			}


			return false;

		},

		destroy: function(code) {

			code = typeof code === 'number' ? code : 0;


			this.trigger('destroy', [ code ]);

			return true;

		}

	};


	return Composite;

});

